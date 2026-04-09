import { useState } from "react";
import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  StitchAuthCard,
  StitchAuthError,
  StitchAuthFieldLabel,
  StitchAuthInput,
  StitchAuthLink,
  StitchAuthPrimaryButton,
} from "@/components/auth/stitch-auth-card";
import { authClient } from "@/lib/auth-client";
import { normalizeRedirectPath } from "@/lib/redirects";
import { getSession } from "@/lib/session";

const signUpSearchSchema = z.object({
  redirect: z.string().optional().transform((value) => normalizeRedirectPath(value, "/dashboard")),
});

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search) => signUpSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: search.redirect });
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

  return (
    <StitchAuthCard
      eyebrow="New account"
      title="Create account"
      description="Set up a reusable customer account for future orders, delivered licenses, and checkout history."
      footerAction={
        <div className="text-center">
          <StitchAuthLink to="/sign-in" search={{ redirect: search.redirect }}>
            Sign in
          </StitchAuthLink>
        </div>
      }
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          setMessage(null);

          await authClient.signUp.email(
            { name, email, password, callbackURL: search.redirect },
            {
              onSuccess: () => {
                setMessage(
                  import.meta.env.DEV
                    ? "Account created. Check your email for the verification link. In local development, Mailpit receives it instantly."
                    : "Account created. Check your email for the verification link.",
                );
              },
              onError: (context) => setError(context.error.message),
            },
          );

          setPending(false);
        }}
      >
        <div className="space-y-3">
          <StitchAuthFieldLabel htmlFor="sign-up-name">Name</StitchAuthFieldLabel>
          <StitchAuthInput
            id="sign-up-name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-3">
          <StitchAuthFieldLabel htmlFor="sign-up-email">Email</StitchAuthFieldLabel>
          <StitchAuthInput
            id="sign-up-email"
            type="email"
            autoComplete="email"
            placeholder="user@domain.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-3">
          <StitchAuthFieldLabel htmlFor="sign-up-password">Password</StitchAuthFieldLabel>
          <StitchAuthInput
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <StitchAuthError message={error} /> : null}
        {message ? <p className="font-mono text-xs text-muted-foreground">{message}</p> : null}
        <StitchAuthPrimaryButton type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </StitchAuthPrimaryButton>
      </form>
    </StitchAuthCard>
  );
}
