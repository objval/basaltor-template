import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { licenseAllocations, orders, paymentAttempts, productVariants } from "@/lib/db/schema";
import { templateConfig } from "@/config/template";
import { createCheckoutForSmokeTest, resolveMockPaymentForSmokeTest } from "@/modules/checkout/checkout.server";

async function main() {
  const oneDay = await db.query.productVariants.findFirst({ where: eq(productVariants.slug, "one-day") });
  const oneMonth = await db.query.productVariants.findFirst({ where: eq(productVariants.slug, "one-month") });

  if (!oneDay || !oneMonth) {
    throw new Error("Seed variants not found.");
  }

  const checkout = await createCheckoutForSmokeTest({
    provider: "stripe",
    items: [
      { variantId: oneDay.id, quantity: 1 },
      { variantId: oneMonth.id, quantity: 1 },
    ],
    customer: {
      mode: "guest",
      fullName: templateConfig.smokeCustomer.fullName,
      email: templateConfig.smokeCustomer.email,
      contactHandle: templateConfig.smokeCustomer.contactHandle,
      country: templateConfig.smokeCustomer.country,
      note: templateConfig.smokeCustomer.note,
    },
    notes: "smoke-test",
  });

  if (!checkout.guestToken) {
    throw new Error("Guest token was not returned for guest checkout.");
  }

  const resolved = await resolveMockPaymentForSmokeTest({
    paymentAttemptPublicId: checkout.paymentAttemptPublicId,
    outcome: "paid",
    guestToken: checkout.guestToken,
  });

  const order = await db.query.orders.findFirst({ where: eq(orders.publicId, resolved.orderPublicId) });
  const attempt = await db.query.paymentAttempts.findFirst({ where: eq(paymentAttempts.publicId, checkout.paymentAttemptPublicId) });
  const allocations = order
    ? await db.select().from(licenseAllocations).where(eq(licenseAllocations.orderId, order.id))
    : [];

  console.log(
    JSON.stringify(
      {
        orderPublicId: checkout.orderPublicId,
        paymentAttemptPublicId: checkout.paymentAttemptPublicId,
        orderStatus: order?.status ?? null,
        customerMode: order?.customerMode ?? null,
        customerEmail: order?.customerEmail ?? null,
        paymentStatus: attempt?.status ?? null,
        allocationCount: allocations.length,
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
