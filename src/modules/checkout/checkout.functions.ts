import { createServerFn } from "@tanstack/react-start";

import { createCheckoutSchema, resolveMockPaymentSchema } from "@/modules/checkout/checkout.schemas";
import { createCheckoutFromCart, resolveMockPayment } from "@/modules/checkout/checkout.server";

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator(createCheckoutSchema)
  .handler(async ({ data }) => {
    return createCheckoutFromCart(data);
  });

export const resolveMockCheckout = createServerFn({ method: "POST" })
  .inputValidator(resolveMockPaymentSchema)
  .handler(async ({ data }) => {
    return resolveMockPayment(data);
  });
