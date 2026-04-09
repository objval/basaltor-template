import { RiShoppingBagLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartState, useCartTotals } from "@/modules/cart/use-cart";

export function CartButton() {
  const cart = useCartState();
  const totals = useCartTotals();

  return (
    <Button variant="outline" size="sm" asChild>
      <Link to="/cart" className="gap-2">
        <RiShoppingBagLine className="size-4" />
        <span>Cart</span>
        {cart.hydrated ? <Badge variant="outline">{totals.itemCount}</Badge> : null}
      </Link>
    </Button>
  );
}
