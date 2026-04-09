export const paymentConfig = {
  defaultProvider: "stripe",
  enabledProviders: ["stripe", "paddle"],
  providers: {
    stripe: {
      id: "stripe",
      displayName: "Stripe",
      checkoutLabel: "Card checkout",
      accentClassName: "border-foreground/20 bg-card",
      helperText: "Fast card checkout flow with provider-specific fulfillment hooks.",
    },
    paddle: {
      id: "paddle",
      displayName: "Paddle",
      checkoutLabel: "Merchant of record checkout",
      accentClassName: "border-foreground/20 bg-card",
      helperText: "Merchant-of-record style checkout flow for international storefronts.",
    },
  },
} as const;

export type PaymentProviderId = (typeof paymentConfig.enabledProviders)[number];
