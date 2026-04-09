import type { CreateCheckoutSessionResult, MockCheckoutContext, PaymentProviderPlugin } from "@/modules/payments/core/contracts";
import { paymentConfig } from "@/config/payments";

export const stripeMockProvider: PaymentProviderPlugin = {
  id: "stripe",
  presentation: paymentConfig.providers.stripe,
  createCheckoutSession: (input: MockCheckoutContext): Promise<CreateCheckoutSessionResult> =>
    Promise.resolve({
      checkoutUrl: `/checkout/mock/${input.paymentAttemptPublicId}`,
      providerReference: `stripe_mock_${input.paymentAttemptPublicId.toLowerCase()}`,
      providerLabel: paymentConfig.providers.stripe.displayName,
    }),
};
