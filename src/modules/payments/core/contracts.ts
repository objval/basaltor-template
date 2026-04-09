export type PaymentProviderId = "stripe" | "paddle";

export type MockCheckoutContext = {
  paymentAttemptPublicId: string;
  orderPublicId: string;
  amountMinor: number;
  currency: string;
};

export type PaymentProviderPresentation = {
  id: PaymentProviderId;
  displayName: string;
  checkoutLabel: string;
  helperText: string;
};

export type CreateCheckoutSessionResult = {
  checkoutUrl: string;
  providerReference: string;
  providerLabel: string;
};

export interface PaymentProviderPlugin {
  id: PaymentProviderId;
  presentation: PaymentProviderPresentation;
  createCheckoutSession: (input: MockCheckoutContext) => Promise<CreateCheckoutSessionResult>;
}
