import { useState } from "react";
import { z } from "zod";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { DEV_MAILPIT_URL } from "@/lib/app-config";
import { getSession } from "@/lib/session";

const signUpSearchSchema = z.object({
  redirect: z.string().min(1).optional(),
});

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search) => signUpSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: search.redirect || "/dashboard" });
    }
  },
  component: SignUpPage,
});

function SignUpPage() {
  const search = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const redirectTo = search.redirect || "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center justify-center px-4 py-10 md:px-6">
      <AuthCard
        title="Create account"
        description="Email verification is enabled. In local development, Mailpit receives the verification link instantly."
        footer={
          <p className="text-sm text-muted-foreground">
            Already registered? <Link to="/sign-in" search={{ redirect: redirectTo }} className="underline underline-offset-4">Sign in</Link>
          </p>
        }
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            setMessage(null);

            await authClient.signUp.email(
              { name, email, password, callbackURL: redirectTo },
              {
                onSuccess: () => {
                  setMessage(`Account created. Verify the email in Mailpit: ${DEV_MAILPIT_URL}`);
                },
                onError: (context) => {
                  setError(context.error.message);
                },
              },
            );

            setPending(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="sign-up-name">Name</Label>
            <Input id="sign-up-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sign-up-email">Email</Label>
            <Input id="sign-up-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sign-up-password">Password</Label>
            <Input id="sign-up-password" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating…" : "Create account"}</Button>
        </form>
      </AuthCard>
    </main>
  );
}
