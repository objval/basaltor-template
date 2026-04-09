import { Store } from "@tanstack/store";

import type { PaymentProviderId } from "@/modules/payments/core/contracts";
import type { CartLine, CartState } from "@/modules/cart/cart.types";
import { commerceConfig } from "@/config/commerce";

const initialState: CartState = {
  hydrated: false,
  selectedProvider: null,
  items: [],
};

export const cartStore = new Store<CartState>(initialState);

function persistCart(state: CartState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    commerceConfig.cartStorageKey,
    JSON.stringify({ selectedProvider: state.selectedProvider, items: state.items }),
  );
}

export function hydrateCart() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(commerceConfig.cartStorageKey);
    if (!raw) {
      cartStore.setState((state) => ({ ...state, hydrated: true }));
      return;
    }

    const parsed = JSON.parse(raw) as Pick<CartState, "selectedProvider" | "items">;
    cartStore.setState(() => ({ hydrated: true, selectedProvider: parsed.selectedProvider, items: parsed.items }));
  } catch {
    cartStore.setState((state) => ({ ...state, hydrated: true }));
  }
}

let persistenceBound = false;
export function bindCartPersistence() {
  if (persistenceBound || typeof window === "undefined") return;
  persistenceBound = true;
  cartStore.subscribe(() => persistCart(cartStore.state));
}

function buildCartLineId(productId: string, variantId: string) {
  return `${productId}:${variantId}`;
}

export function addCartItem(item: Omit<CartLine, "cartLineId">) {
  const cartLineId = buildCartLineId(item.productId, item.variantId);
  cartStore.setState((state) => {
    const existing = state.items.find((line) => line.cartLineId === cartLineId);
    if (existing) {
      return {
        ...state,
        items: state.items.map((line) =>
          line.cartLineId === cartLineId ? { ...line, quantity: line.quantity + item.quantity } : line,
        ),
      };
    }

    return {
      ...state,
      items: [...state.items, { ...item, cartLineId }],
    };
  });
}

export function updateCartItemQuantity(cartLineId: string, quantity: number) {
  if (quantity <= 0) {
    removeCartItem(cartLineId);
    return;
  }

  cartStore.setState((state) => ({
    ...state,
    items: state.items.map((line) => (line.cartLineId === cartLineId ? { ...line, quantity } : line)),
  }));
}

export function removeCartItem(cartLineId: string) {
  cartStore.setState((state) => ({
    ...state,
    items: state.items.filter((line) => line.cartLineId !== cartLineId),
  }));
}

export function clearCart() {
  cartStore.setState((state) => ({ ...state, items: [] }));
}

export function setSelectedPaymentProvider(provider: PaymentProviderId) {
  cartStore.setState((state) => ({ ...state, selectedProvider: provider }));
}

export function getCartTotals(state: CartState) {
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalMinor = state.items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  return {
    itemCount,
    subtotalMinor,
  };
}
