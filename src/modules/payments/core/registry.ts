import type { PaymentProviderId, PaymentProviderPlugin } from "@/modules/payments/core/contracts";
import { paymentConfig } from "@/config/payments";
import { paddleMockProvider } from "@/modules/payments/providers/paddle/paddle.mock";
import { stripeMockProvider } from "@/modules/payments/providers/stripe/stripe.mock";

const providers: Record<PaymentProviderId, PaymentProviderPlugin> = {
  stripe: stripeMockProvider,
  paddle: paddleMockProvider,
};

export function getEnabledPaymentProviders() {
  return paymentConfig.enabledProviders.map((providerId) => providers[providerId]);
}

export function getPaymentProvider(providerId: PaymentProviderId) {
  return providers[providerId];
}

export function getDefaultPaymentProvider() {
  return providers[paymentConfig.defaultProvider];
}
