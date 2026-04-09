import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { CartButton } from "@/components/layout/cart-button";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const session = authClient.useSession();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <BrandMark size="sm" className="border-none bg-transparent px-0 py-0 hover:bg-transparent" />
          <nav className="hidden items-center gap-3 md:flex">
            <Link to="/" className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground">
              Store
            </Link>
            {session.data ? (
              <>
                <Link to="/orders" className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground">
                  Orders
                </Link>
                <Link to="/licenses" className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground">
                  Licenses
                </Link>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <CartButton />
          <ThemeToggle />
          {session.data ? (
            <UserMenu session={session.data} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
