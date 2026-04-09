import type { CreateCheckoutSessionResult, MockCheckoutContext, PaymentProviderPlugin } from "@/modules/payments/core/contracts";
import { paymentConfig } from "@/config/payments";

export const paddleMockProvider: PaymentProviderPlugin = {
  id: "paddle",
  presentation: paymentConfig.providers.paddle,
  createCheckoutSession: (input: MockCheckoutContext): Promise<CreateCheckoutSessionResult> =>
    Promise.resolve({
      checkoutUrl: `/checkout/mock/${input.paymentAttemptPublicId}`,
      providerReference: `paddle_mock_${input.paymentAttemptPublicId.toLowerCase()}`,
      providerLabel: paymentConfig.providers.paddle.displayName,
    }),
};
