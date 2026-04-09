import { useStore } from "@tanstack/react-store";

import { cartStore, getCartTotals } from "@/modules/cart/cart.store";

export function useCartState() {
  return useStore(cartStore, (state) => state);
}

export function useCartTotals() {
  return useStore(cartStore, (state) => getCartTotals(state));
}
