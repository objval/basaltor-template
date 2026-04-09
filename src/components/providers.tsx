import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

import { bindCartPersistence, hydrateCart } from "@/modules/cart/cart.store";

function StoreBootstrap() {
  useEffect(() => {
    hydrateCart();
    bindCartPersistence();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StoreBootstrap />
      {children}
    </ThemeProvider>
  );
}
