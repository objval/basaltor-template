import { and, asc, eq, inArray } from "drizzle-orm";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { Session } from "@/lib/auth";
import type { CreateCheckoutInput, ResolveMockPaymentInput } from "@/modules/checkout/checkout.schemas";
import type { PaymentProviderId } from "@/modules/payments/core/contracts";
import { getOptionalServerSession } from "@/lib/auth-guards";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db/client";
import { licenseAllocations, licenseKeys, licensePools, orderItems, orders, paymentAttempts, productVariants, products } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { sendGuestOrderEmail } from "@/lib/mailer";
import { buildGuestOrderAccessUrl, createGuestAccessToken, getGuestAccessExpiryDate, hashGuestAccessToken, verifyGuestAccessToken } from "@/lib/order-access";
import { generatePublicOrderId, generatePublicPaymentAttemptId } from "@/lib/public-ids";
import { deriveRateLimitActor, enforceRateLimit } from "@/lib/rate-limit";
import { buildOrderTrackingSnapshot } from "@/lib/request-tracking";
import { getPaymentProvider } from "@/modules/payments/core/registry";

async function getVariantProductRows(variantIds: Array<string>) {
  return db
    .select({
      variant: productVariants,
      product: products,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(inArray(productVariants.id, variantIds));
}

async function getAvailableKeysForVariant(variantId: string, quantity: number) {
  return db
    .select({
      key: licenseKeys,
    })
    .from(licenseKeys)
    .innerJoin(licensePools, eq(licensePools.id, licenseKeys.poolId))
    .where(and(eq(licensePools.variantId, variantId), eq(licenseKeys.status, "available")))
    .orderBy(asc(licenseKeys.createdAt))
    .limit(quantity);
}

type CheckoutViewerContext = {
  session: Session | null;
  customerMode: "account" | "guest";
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerContactHandle: string | null;
  customerCountry: string | null;
  customerNote: string | null;
  guestAccessToken: string | null;
  guestAccessTokenExpiresAt: Date | null;
};

function normalizeOptional(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildCheckoutViewerContext(session: Session | null, input: CreateCheckoutInput): CheckoutViewerContext {
  if (session) {
    return {
      session,
      customerMode: "account",
      userId: session.user.id,
      customerName: normalizeOptional(input.customer.fullName) ?? normalizeOptional(session.user.name) ?? session.user.email,
      customerEmail: session.user.email,
      customerContactHandle: normalizeOptional(input.customer.contactHandle),
      customerCountry: normalizeOptional(input.customer.country),
      customerNote: normalizeOptional(input.customer.note),
      guestAccessToken: null,
      guestAccessTokenExpiresAt: null,
    };
  }

  if (input.customer.mode !== "guest") {
    throw new Error("Sign in to use account checkout, or switch to guest checkout.");
  }

  return {
    session: null,
    customerMode: "guest",
    userId: null,
    customerName: input.customer.fullName.trim(),
    customerEmail: input.customer.email.trim().toLowerCase(),
    customerContactHandle: normalizeOptional(input.customer.contactHandle),
    customerCountry: normalizeOptional(input.customer.country),
    customerNote: normalizeOptional(input.customer.note),
    guestAccessToken: createGuestAccessToken(),
    guestAccessTokenExpiresAt: getGuestAccessExpiryDate(),
  };
}

function assertGuestOrderAccess(order: typeof orders.$inferSelect, guestToken: string | undefined) {
  if (order.customerMode !== "guest") {
    return false;
  }

  if (!guestToken || !order.guestAccessTokenHash || !order.guestAccessTokenExpiresAt) {
    return false;
  }

  if (order.guestAccessTokenExpiresAt <= new Date()) {
    return false;
  }

  return verifyGuestAccessToken({ token: guestToken, tokenHash: order.guestAccessTokenHash });
}

function enforceCheckoutMutationRateLimit(headers: Headers, bucket: string, fallbackKey: string, windowMs: number, max: number) {
  const actor = deriveRateLimitActor(headers, fallbackKey);
  enforceRateLimit({
    bucket,
    key: actor,
    windowMs,
    max,
  });
}

async function createCheckoutForViewer(context: CheckoutViewerContext, input: CreateCheckoutInput, headers: Headers = getRequestHeaders()) {
  const env = getServerEnv();
  if (env.NODE_ENV === "production") {
    throw new Error("Mock checkout providers are disabled in production.");
  }

  enforceCheckoutMutationRateLimit(
    headers,
    "checkout:create",
    context.userId ?? context.customerEmail,
    10 * 60 * 1000,
    10,
  );

  const providerId = input.provider as PaymentProviderId;
  const provider = getPaymentProvider(providerId);
  const variantIds = input.items.map((item) => item.variantId);
  const rows = await getVariantProductRows(variantIds);

  if (rows.length !== variantIds.length) {
    throw new Error("One or more variants are unavailable.");
  }

  const variantMap = new Map(rows.map((row) => [row.variant.id, row]));
  let subtotalMinor = 0;
  let itemCount = 0;

  const preparedItems = await Promise.all(
    input.items.map(async (item) => {
      const row = variantMap.get(item.variantId);
      if (!row) {
        throw new Error("Missing variant.");
      }

      if (row.product.status !== "active" || !row.variant.isActive) {
        throw new Error(`Variant ${row.variant.name} is not available.`);
      }

      if (row.variant.stockMode === "finite") {
        const keys = await getAvailableKeysForVariant(row.variant.id, item.quantity);
        if (keys.length < item.quantity) {
          throw new Error(`Not enough license keys available for ${row.product.name} · ${row.variant.name}.`);
        }
      }

      const totalPriceMinor = row.variant.priceMinor * item.quantity;
      subtotalMinor += totalPriceMinor;
      itemCount += item.quantity;

      return {
        product: row.product,
        variant: row.variant,
        quantity: item.quantity,
        totalPriceMinor,
      };
    }),
  );

  const orderId = crypto.randomUUID();
  const publicOrderId = generatePublicOrderId();
  const paymentAttemptId = crypto.randomUUID();
  const publicPaymentAttemptId = generatePublicPaymentAttemptId(providerId);
  const tracking = buildOrderTrackingSnapshot(headers);

  const checkoutSession = await provider.createCheckoutSession({
    paymentAttemptPublicId: publicPaymentAttemptId,
    orderPublicId: publicOrderId,
    amountMinor: subtotalMinor,
    currency: preparedItems[0]?.variant.currency ?? "USD",
  });

  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      publicId: publicOrderId,
      userId: context.userId,
      customerMode: context.customerMode,
      customerName: context.customerName,
      customerEmail: context.customerEmail,
      customerContactHandle: context.customerContactHandle,
      customerCountry: context.customerCountry,
      customerNote: context.customerNote,
      guestAccessTokenHash: context.guestAccessToken ? hashGuestAccessToken(context.guestAccessToken) : null,
      guestAccessTokenExpiresAt: context.guestAccessTokenExpiresAt,
      placedFromIp: tracking.ipAddress,
      placedFromUserAgent: tracking.userAgent,
      placedFromReferrer: tracking.referrer,
      placedFromAcceptLanguage: tracking.acceptLanguage,
      status: "pending_payment",
      currency: preparedItems[0]?.variant.currency ?? "USD",
      subtotalMinor,
      totalMinor: subtotalMinor,
      itemCount,
      notes: input.notes || null,
    });

    await tx.insert(orderItems).values(
      preparedItems.map((item) => ({
        orderId,
        productId: item.product.id,
        variantId: item.variant.id,
        productName: item.product.name,
        variantName: item.variant.name,
        variantSlug: item.variant.slug,
        durationDays: item.variant.durationDays,
        quantity: item.quantity,
        unitPriceMinor: item.variant.priceMinor,
        totalPriceMinor: item.totalPriceMinor,
        currency: item.variant.currency,
      })),
    );

    await tx.insert(paymentAttempts).values({
      id: paymentAttemptId,
      publicId: publicPaymentAttemptId,
      orderId,
      provider: providerId,
      status: "pending",
      amountMinor: subtotalMinor,
      currency: preparedItems[0]?.variant.currency ?? "USD",
      checkoutUrl: checkoutSession.checkoutUrl,
      providerReference: checkoutSession.providerReference,
      providerLabel: checkoutSession.providerLabel,
      metadata: {
        orderPublicId: publicOrderId,
      },
    });
  });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "order.created",
    resource: "order",
    details: {
      orderPublicId: publicOrderId,
      customerMode: context.customerMode,
      customerEmail: context.customerEmail,
      paymentAttemptPublicId: publicPaymentAttemptId,
      itemCount,
      placedFromIp: tracking.ipAddress,
    },
  });

  if (context.customerMode === "guest" && context.guestAccessToken) {
    const accessUrl = buildGuestOrderAccessUrl({
      appUrl: env.APP_URL,
      publicId: publicOrderId,
      token: context.guestAccessToken,
    });

    try {
      await sendGuestOrderEmail({
        to: context.customerEmail,
        subject: `Your ${publicOrderId} order access link`,
        headline: "Guest order created",
        body: `Keep this secure link so you can reopen your order, review payment status, and retrieve your licenses after payment completes.`,
        actionUrl: accessUrl,
      });
    } catch (error) {
      console.error("Failed to send guest order email", error);
    }
  }

  return {
    orderPublicId: publicOrderId,
    paymentAttemptPublicId: publicPaymentAttemptId,
    checkoutUrl: checkoutSession.checkoutUrl,
    providerLabel: checkoutSession.providerLabel,
    customerMode: context.customerMode,
    guestToken: context.guestAccessToken,
  };
}

async function resolveMockPaymentForViewer(
  session: Session | null,
  input: ResolveMockPaymentInput,
  headers: Headers = getRequestHeaders(),
) {
  const env = getServerEnv();
  if (env.NODE_ENV === "production") {
    throw new Error("Mock payment resolution is disabled in production.");
  }

  enforceCheckoutMutationRateLimit(headers, "checkout:resolve-mock", input.paymentAttemptPublicId, 60 * 1000, 12);

  const attempt = await db.query.paymentAttempts.findFirst({
    where: eq(paymentAttempts.publicId, input.paymentAttemptPublicId),
  });

  if (!attempt) {
    throw new Error("Payment attempt not found.");
  }

  const order = await db.query.orders.findFirst({ where: eq(orders.id, attempt.orderId) });
  if (!order) {
    throw new Error("Order not found.");
  }

  const sessionCanAccess = !!session && order.userId === session.user.id;
  const guestCanAccess = assertGuestOrderAccess(order, input.guestToken);

  if (!sessionCanAccess && !guestCanAccess) {
    throw new Error("This checkout is not accessible for the current viewer.");
  }

  if (input.outcome === "failed" && (attempt.status === "failed" || order.status === "failed")) {
    return {
      orderPublicId: order.publicId,
      status: "failed" as const,
      customerMode: order.customerMode,
      guestToken: guestCanAccess ? input.guestToken ?? null : null,
    };
  }

  if (input.outcome === "paid" && order.status === "fulfilled") {
    return {
      orderPublicId: order.publicId,
      status: "fulfilled" as const,
      customerMode: order.customerMode,
      guestToken: guestCanAccess ? input.guestToken ?? null : null,
    };
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.createdAt));

  if (input.outcome === "failed") {
    await db.transaction(async (tx) => {
      await tx.update(paymentAttempts).set({ status: "failed", updatedAt: new Date() }).where(eq(paymentAttempts.id, attempt.id));
      await tx.update(orders).set({ status: "failed", updatedAt: new Date() }).where(eq(orders.id, order.id));
    });

    return {
      orderPublicId: order.publicId,
      status: "failed" as const,
      customerMode: order.customerMode,
      guestToken: guestCanAccess ? input.guestToken ?? null : null,
    };
  }

  await db.transaction(async (tx) => {
    await tx.update(paymentAttempts).set({ status: "paid", updatedAt: new Date() }).where(eq(paymentAttempts.id, attempt.id));
    await tx.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, order.id));

    for (const item of items) {
      const variant = item.variantId ? await tx.query.productVariants.findFirst({ where: eq(productVariants.id, item.variantId) }) : null;
      if (!variant) {
        throw new Error(`Missing variant for order item ${item.id}.`);
      }

      if (variant.stockMode === "finite") {
        const available = await tx
          .select({ key: licenseKeys })
          .from(licenseKeys)
          .innerJoin(licensePools, eq(licensePools.id, licenseKeys.poolId))
          .where(and(eq(licensePools.variantId, variant.id), eq(licenseKeys.status, "available")))
          .orderBy(asc(licenseKeys.createdAt))
          .limit(item.quantity);

        if (available.length < item.quantity) {
          throw new Error(`Not enough remaining keys for ${item.variantName}.`);
        }

        for (const row of available) {
          await tx
            .update(licenseKeys)
            .set({ status: "allocated", allocatedToUserId: order.userId, allocatedAt: new Date() })
            .where(eq(licenseKeys.id, row.key.id));

          await tx.insert(licenseAllocations).values({
            orderId: order.id,
            orderItemId: item.id,
            licenseKeyId: row.key.id,
            userId: order.userId,
            deliveredKey: row.key.value,
          });
        }
      }
    }

    await tx.update(orders).set({ status: "fulfilled", updatedAt: new Date() }).where(eq(orders.id, order.id));
  });

  await writeAuditLog({
    actorUserId: session?.user.id ?? order.userId,
    action: "order.fulfilled",
    resource: "order",
    details: { orderPublicId: order.publicId, paymentAttemptPublicId: attempt.publicId, customerMode: order.customerMode },
  });

  return {
    orderPublicId: order.publicId,
    status: "fulfilled" as const,
    customerMode: order.customerMode,
    guestToken: guestCanAccess ? input.guestToken ?? null : null,
  };
}

export async function createCheckoutFromCart(input: CreateCheckoutInput) {
  const session = await getOptionalServerSession();
  const context = buildCheckoutViewerContext(session as Session | null, input);
  return createCheckoutForViewer(context, input);
}

export async function createCheckoutForSmokeTest(input: CreateCheckoutInput) {
  const context = buildCheckoutViewerContext(null, input);
  return createCheckoutForViewer(context, input, new Headers());
}

export async function resolveMockPayment(input: ResolveMockPaymentInput) {
  const session = await getOptionalServerSession();
  return resolveMockPaymentForViewer((session as Session | null) ?? null, input);
}

export async function resolveMockPaymentForSmokeTest(input: ResolveMockPaymentInput) {
  return resolveMockPaymentForViewer(null, input, new Headers());
}
