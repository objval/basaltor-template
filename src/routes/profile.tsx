import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    return { session };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { session } = Route.useRouteContext();

  return (
    <AppShell
      role={session.user.role}
      sectionLabel="Account"
      title="Profile & security"
      description="Update your account details and rotate credentials."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your name and account details.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm session={session} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password and revoke other sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
