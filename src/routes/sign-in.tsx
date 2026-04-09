import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { z } from "zod";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

const signInSearchSchema = z.object({
  redirect: z.string().min(1).optional(),
});

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search) => signInSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: search.redirect || "/dashboard" });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  const search = Route.useSearch();
  const redirectTo = search.redirect || "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center justify-center px-4 py-10 md:px-6">
      <AuthCard
        title="Sign in"
        eyebrow={null}
        footer={
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/sign-up" search={{ redirect: redirectTo }} className="underline underline-offset-4">
              Create account
            </Link>
          </p>
        }
      >
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="email-code">Email code</TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="mt-4">
            <PasswordSignIn redirectTo={redirectTo} />
          </TabsContent>
          <TabsContent value="email-code" className="mt-4">
            <EmailOtpSignIn redirectTo={redirectTo} />
          </TabsContent>
        </Tabs>
      </AuthCard>
    </main>
  );
}

// --- Password sign-in ---
function redirectAfterAuth(redirectTo: string) {
  window.location.assign(redirectTo);
}

function PasswordSignIn({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        await authClient.signIn.email(
          { email, password, callbackURL: redirectTo, rememberMe: true },
          {
            onSuccess: () => {
              redirectAfterAuth(redirectTo);
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
        <Label htmlFor="password-email">Email</Label>
        <Input id="password-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-password">Password</Label>
        <Input id="password-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

// --- Email OTP sign-in (two-step) ---
function EmailOtpSignIn({ redirectTo }: { redirectTo: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return step === "email" ? (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setMessage(null);

        await authClient.emailOtp.sendVerificationOtp(
          { email, type: "sign-in" },
          {
            onSuccess: () => {
              setMessage(null);
              setStep("code");
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
        <Label htmlFor="otp-email">Email</Label>
        <Input id="otp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code…" : "Send code"}
      </Button>
    </form>
  ) : (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        await authClient.signIn.emailOtp(
          { email, otp, callbackURL: redirectTo },
          {
            onSuccess: () => {
              redirectAfterAuth(redirectTo);
            },
            onError: (context) => {
              setError(context.error.message);
            },
          },
        );

        setPending(false);
      }}
    >
      <div className="space-y-3 text-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{email}</p>
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-4"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError(null);
              setMessage(null);
            }}
          >
            Use a different email
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Label htmlFor="otp-code" className="sr-only">6-digit code</Label>
          <InputOTP
            id="otp-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={setOtp}
            aria-invalid={error ? true : undefined}
            disabled={pending}
            containerClassName="justify-center"
            className="gap-0"
            required
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        </div>
      </div>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" className="w-full" disabled={pending || otp.length < 6}>
        {pending ? "Verifying…" : "Verify code"}
      </Button>
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-muted-foreground"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            await authClient.emailOtp.sendVerificationOtp(
              { email, type: "sign-in" },
              {
                onSuccess: () => setMessage("Code resent."),
                onError: (context) => setError(context.error.message),
              },
            );
            setPending(false);
          }}
        >
          Resend code
        </Button>
      </div>
    </form>
  );
}
