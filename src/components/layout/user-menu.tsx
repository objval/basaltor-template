import { RiKey2Line, RiLogoutBoxRLine, RiShieldUserLine, RiShoppingBag3Line, RiUserLine } from "@remixicon/react";
import { useRouter } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { roleLabel } from "@/lib/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu({
  session,
}: {
  session: Awaited<ReturnType<typeof authClient.getSession>>["data"];
}) {
  const router = useRouter();

  if (!session) {
    return null;
  }

  const initials = session.user.name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 px-2">
          <Avatar className="size-6 border border-border">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="max-w-28 truncate">{session.user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>{session.user.name}</span>
          <span className="text-xs text-muted-foreground">{session.user.email}</span>
          <Badge variant="outline" className="mt-1 w-fit uppercase">{roleLabel(session.user.role)}</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.navigate({ to: "/dashboard" })}>
          <RiShieldUserLine className="mr-2 size-4" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.navigate({ to: "/profile" })}>
          <RiUserLine className="mr-2 size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.navigate({ to: "/orders" })}>
          <RiShoppingBag3Line className="mr-2 size-4" /> Orders
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.navigate({ to: "/licenses" })}>
          <RiKey2Line className="mr-2 size-4" /> Licenses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.navigate({ to: "/" });
                },
              },
            });
          }}
        >
          <RiLogoutBoxRLine className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
