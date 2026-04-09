import { useEffect } from "react";

import type { UserTheme } from "@/lib/theme";
import { AppThemeProvider } from "@/components/theme/theme-provider";
import { bindCartPersistence, hydrateCart } from "@/modules/cart/cart.store";

function StoreBootstrap() {
  useEffect(() => {
    hydrateCart();
    bindCartPersistence();
  }, []);

  return null;
}

type ProvidersProps = {
  children: React.ReactNode;
  forcedTheme?: UserTheme;
};

export function Providers({ children, forcedTheme }: ProvidersProps) {
  return (
    <AppThemeProvider disableTransitionOnChange forcedTheme={forcedTheme}>
      <StoreBootstrap />
      {children}
    </AppThemeProvider>
  );
}
