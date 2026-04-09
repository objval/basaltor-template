import { useState } from "react";
import { RiLogoutBoxRLine, RiMenuLine } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { getNavigationForRole } from "@/lib/rbac";
import { BrandMark } from "@/components/layout/brand-mark";
import { CartButton } from "@/components/layout/cart-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppHeader() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthed = !!session.data;
  const accountNavigation = isAuthed ? getNavigationForRole(session.data?.user.role) : [];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-8">
          <BrandMark size="sm" className="border-none bg-transparent px-0 py-0 hover:bg-transparent" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/">Store</NavLink>
            {isAuthed ? (
              <>
                <NavLink to="/orders">Orders</NavLink>
                <NavLink to="/licenses">Licenses</NavLink>
              </>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <CartButton />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {isAuthed ? (
            <div className="hidden md:block">
              <UserMenu session={session.data} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <Link to="/sign-in" search={{ redirect: "/dashboard" }}>Sign in</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground">
                <Link to="/sign-up" search={{ redirect: "/dashboard" }}>Create account</Link>
              </Button>
            </div>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" className="md:hidden" aria-label="Open navigation menu">
                <RiMenuLine className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs border-l border-border bg-background p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="font-mono text-sm uppercase tracking-[0.18em]">Navigation</SheetTitle>
                <SheetDescription>
                  Quick access to storefront pages, account routes, and theme controls.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Browse
                  </p>
                  <div className="grid gap-2">
                    <MobileNavLink to="/" onNavigate={() => setMobileMenuOpen(false)}>
                      Store
                    </MobileNavLink>
                    <MobileNavLink to="/cart" onNavigate={() => setMobileMenuOpen(false)}>
                      Cart
                    </MobileNavLink>
                  </div>
                </div>

                {isAuthed ? (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Account
                    </p>
                    <div className="grid gap-2">
                      {accountNavigation.map((item) => (
                        <MobileNavLink key={item.href} to={item.href} onNavigate={() => setMobileMenuOpen(false)}>
                          {item.title}
                        </MobileNavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      Access
                    </p>
                    <div className="grid gap-2">
                      <MobileNavLink to="/sign-in" search={{ redirect: "/dashboard" }} onNavigate={() => setMobileMenuOpen(false)}>
                        Sign in
                      </MobileNavLink>
                      <MobileNavLink to="/sign-up" search={{ redirect: "/dashboard" }} onNavigate={() => setMobileMenuOpen(false)}>
                        Create account
                      </MobileNavLink>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Theme
                  </p>
                  <ThemeToggle />
                </div>
              </div>
              {isAuthed ? (
                <div className="border-t border-border p-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start font-mono text-[10px] uppercase tracking-[0.24em]"
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            setMobileMenuOpen(false);
                            navigate({ to: "/" });
                          },
                        },
                      });
                    }}
                  >
                    <RiLogoutBoxRLine className="size-4" />
                    Sign out
                  </Button>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  search,
  children,
  onNavigate,
}: {
  to: string;
  search?: Record<string, string>;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        search={search}
        onClick={onNavigate}
        className="border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-accent"
      >
        {children}
      </Link>
    </SheetClose>
  );
}
