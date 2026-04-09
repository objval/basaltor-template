import { asc, desc, eq, inArray } from "drizzle-orm";

import { getOptionalServerSession } from "@/lib/auth-guards";
import { db } from "@/lib/db/client";
import { PERMISSIONS, hasPermission } from "@/lib/rbac";
import { verifyGuestAccessToken } from "@/lib/order-access";
import { categories, licenseAllocations, orderItems, orders, paymentAttempts, productVariants, products } from "@/lib/db/schema";

async function getOrderItemsForOrders(orderIds: Array<string>) {
  if (!orderIds.length) return [] as Array<typeof orderItems.$inferSelect>;

  return db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)).orderBy(asc(orderItems.createdAt));
}

async function getPaymentAttemptsForOrders(orderIds: Array<string>) {
  if (!orderIds.length) return [] as Array<typeof paymentAttempts.$inferSelect>;

  return db
    .select()
    .from(paymentAttempts)
    .where(inArray(paymentAttempts.orderId, orderIds))
    .orderBy(desc(paymentAttempts.createdAt));
}

async function getOrderViewerAccess(order: typeof orders.$inferSelect, guestToken?: string) {
  const session = await getOptionalServerSession();
  const isPrivileged = !!session && hasPermission(session.user.role, PERMISSIONS.usersManage);

  if (session && (order.userId === session.user.id || isPrivileged)) {
    return {
      kind: isPrivileged && order.userId !== session.user.id ? ("admin" as const) : ("account" as const),
      session,
      isPrivileged,
    };
  }

  if (
    order.customerMode === "guest" &&
    guestToken &&
    order.guestAccessTokenHash &&
    order.guestAccessTokenExpiresAt &&
    order.guestAccessTokenExpiresAt > new Date() &&
    verifyGuestAccessToken({ token: guestToken, tokenHash: order.guestAccessTokenHash })
  ) {
    return {
      kind: "guest" as const,
      session: null,
      isPrivileged: false,
    };
  }

  return null;
}

export async function getOrdersForCurrentUser() {
  const session = await getOptionalServerSession();
  if (!session) {
    return [];
  }

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  const [items, attempts] = await Promise.all([
    getOrderItemsForOrders(orderRows.map((order) => order.id)),
    getPaymentAttemptsForOrders(orderRows.map((order) => order.id)),
  ]);

  const itemsByOrder = new Map<string, Array<typeof orderItems.$inferSelect>>();
  for (const item of items) {
    const bucket = itemsByOrder.get(item.orderId) ?? [];
    bucket.push(item);
    itemsByOrder.set(item.orderId, bucket);
  }

  const attemptsByOrder = new Map<string, Array<typeof paymentAttempts.$inferSelect>>();
  for (const attempt of attempts) {
    const bucket = attemptsByOrder.get(attempt.orderId) ?? [];
    bucket.push(attempt);
    attemptsByOrder.set(attempt.orderId, bucket);
  }

  return orderRows.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) ?? [],
    latestPaymentAttempt: (attemptsByOrder.get(order.id) ?? [])[0] ?? null,
  }));
}

export async function getOrderDetailForViewer(publicId: string, guestToken?: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.publicId, publicId),
  });

  if (!order) return null;

  const viewer = await getOrderViewerAccess(order, guestToken);
  if (!viewer) {
    return null;
  }

  const [items, attempts, allocations] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.createdAt)),
    db.select().from(paymentAttempts).where(eq(paymentAttempts.orderId, order.id)).orderBy(desc(paymentAttempts.createdAt)),
    db.select().from(licenseAllocations).where(eq(licenseAllocations.orderId, order.id)).orderBy(asc(licenseAllocations.deliveredAt)),
  ]);

  return {
    ...order,
    items,
    paymentAttempts: attempts,
    allocations,
    viewerMode: viewer.kind,
    isPrivileged: viewer.isPrivileged,
  };
}

export async function getOrderDetailForCurrentUser(publicId: string) {
  return getOrderDetailForViewer(publicId);
}

export async function getGuestOrderDetail(publicId: string, guestToken: string) {
  return getOrderDetailForViewer(publicId, guestToken);
}

export async function getLicensesForCurrentUser() {
  const session = await getOptionalServerSession();
  if (!session) {
    return [];
  }

  const allocations = await db
    .select({
      allocation: licenseAllocations,
      item: orderItems,
      order: orders,
      variant: productVariants,
      product: products,
      category: categories,
    })
    .from(licenseAllocations)
    .innerJoin(orderItems, eq(orderItems.id, licenseAllocations.orderItemId))
    .innerJoin(orders, eq(orders.id, licenseAllocations.orderId))
    .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(licenseAllocations.userId, session.user.id))
    .orderBy(desc(licenseAllocations.deliveredAt));

  return allocations;
}

export async function getMockPaymentAttempt(publicId: string, guestToken?: string) {
  const attempt = await db.query.paymentAttempts.findFirst({
    where: eq(paymentAttempts.publicId, publicId),
  });

  if (!attempt) return null;

  const order = await db.query.orders.findFirst({ where: eq(orders.id, attempt.orderId) });
  if (!order) return null;

  const viewer = await getOrderViewerAccess(order, guestToken);
  if (!viewer) {
    return null;
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.createdAt));
  return { attempt, order, items, viewerMode: viewer.kind };
}
