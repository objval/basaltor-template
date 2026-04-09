import type { PaymentProviderId } from "@/modules/payments/core/contracts";

export type CartLine = {
  cartLineId: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  variantSlug: string;
  durationDays: number | null;
  unitPriceMinor: number;
  currency: string;
  quantity: number;
};

export type CartState = {
  hydrated: boolean;
  selectedProvider: PaymentProviderId | null;
  items: Array<CartLine>;
};
