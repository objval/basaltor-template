import { useEffect, useMemo, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  StitchAuthCard,
  StitchAuthError,
  StitchAuthFieldLabel,
  StitchAuthInput,
  StitchAuthLink,
  StitchAuthOutlineButton,
  StitchAuthPrimaryButton,
} from "@/components/auth/stitch-auth-card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { normalizeRedirectPath } from "@/lib/redirects";
import { getSession } from "@/lib/session";

const OTP_EXPIRY_SECONDS = 300;

const signInSearchSchema = z.object({
  redirect: z.string().optional().transform((value) => normalizeRedirectPath(value, "/dashboard")),
});

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search) => signInSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: search.redirect });
    }
  },
  component: SignInPage,
});

function redirectAfterAuth(redirectTo: string) {
  window.location.assign(redirectTo);
}

function SignInPage() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<"password" | "email-code">("password");

  return (
    <StitchAuthCard
      eyebrow="Account access"
      title="Sign in"
      description="Access your orders, delivered licenses, and account settings."
      footerAction={
        <div className="text-center">
          <StitchAuthLink to="/sign-up" search={{ redirect: search.redirect }}>
            Create account
          </StitchAuthLink>
        </div>
      }
    >
      <div className="flex border-b border-border">
        <button
          type="button"
          className={`flex-1 border-b py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors ${
            tab === "password"
              ? "border-primary font-bold text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("password")}
        >
          Password
        </button>
        <button
          type="button"
          className={`flex-1 border-b py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors ${
            tab === "email-code"
              ? "border-primary font-bold text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("email-code")}
        >
          Email code
        </button>
      </div>

      {tab === "password" ? (
        <PasswordSignIn redirectTo={search.redirect} />
      ) : (
        <EmailOtpSignIn redirectTo={search.redirect} />
      )}
    </StitchAuthCard>
  );
}

function PasswordSignIn({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        await authClient.signIn.email(
          { email, password, callbackURL: redirectTo, rememberMe: true },
          {
            onSuccess: () => redirectAfterAuth(redirectTo),
            onError: (context) => setError(context.error.message),
          },
        );

        setPending(false);
      }}
    >
      <div className="space-y-3">
        <StitchAuthFieldLabel htmlFor="password-email">Email</StitchAuthFieldLabel>
        <StitchAuthInput
          id="password-email"
          type="email"
          autoComplete="email"
          placeholder="user@domain.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-3">
        <StitchAuthFieldLabel htmlFor="password-password">Password</StitchAuthFieldLabel>
        <StitchAuthInput
          id="password-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <StitchAuthError message={error} /> : null}
      <StitchAuthPrimaryButton type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </StitchAuthPrimaryButton>
    </form>
  );
}

function EmailOtpSignIn({ redirectTo }: { redirectTo: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    if (step !== "code" || !sentAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, sentAt]);

  const remainingLabel = useMemo(() => {
    const remainingSeconds = sentAt
      ? Math.max(OTP_EXPIRY_SECONDS - Math.floor((clock - sentAt) / 1000), 0)
      : OTP_EXPIRY_SECONDS;

    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [clock, sentAt]);

  if (step === "email") {
    return (
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          setMessage(null);

          await authClient.emailOtp.sendVerificationOtp(
            { email, type: "sign-in" },
            {
              onSuccess: () => {
                setOtp("");
                setSentAt(Date.now());
                setClock(Date.now());
                setStep("code");
              },
              onError: (context) => setError(context.error.message),
            },
          );

          setPending(false);
        }}
      >
        <div className="space-y-3">
          <StitchAuthFieldLabel htmlFor="otp-email">Email</StitchAuthFieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <StitchAuthInput
              id="otp-email"
              type="email"
              autoComplete="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <StitchAuthOutlineButton type="submit" disabled={pending} className="sm:min-w-32">
              {pending ? "Sending…" : "Send code"}
            </StitchAuthOutlineButton>
          </div>
        </div>
        {error ? <StitchAuthError message={error} /> : null}
      </form>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        await authClient.signIn.emailOtp(
          { email, otp, callbackURL: redirectTo },
          {
            onSuccess: () => redirectAfterAuth(redirectTo),
            onError: (context) => setError(context.error.message),
          },
        );

        setPending(false);
      }}
    >
      <div className="space-y-3">
        <StitchAuthFieldLabel htmlFor="otp-code">Verification code</StitchAuthFieldLabel>
        <div className="flex justify-center sm:justify-start">
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
            containerClassName="justify-center sm:justify-start"
            className="gap-0"
            required
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-10 text-sm md:size-11" />
              <InputOTPSlot index={1} className="size-10 text-sm md:size-11" />
              <InputOTPSlot index={2} className="size-10 text-sm md:size-11" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-10 text-sm md:size-11" />
              <InputOTPSlot index={4} className="size-10 text-sm md:size-11" />
              <InputOTPSlot index={5} className="size-10 text-sm md:size-11" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => {
            setStep("email");
            setOtp("");
            setSentAt(null);
            setError(null);
            setMessage(null);
          }}
        >
          Change email
        </button>
        <span className="break-all font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {email}
        </span>
      </div>

      {error ? <StitchAuthError message={error} /> : null}
      {message ? <p className="font-mono text-xs text-muted-foreground">{message}</p> : null}

      <div className="space-y-4">
        <StitchAuthPrimaryButton type="submit" disabled={pending || otp.length < 6}>
          {pending ? "Verifying…" : "Verify code"}
        </StitchAuthPrimaryButton>
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              setMessage(null);

              await authClient.emailOtp.sendVerificationOtp(
                { email, type: "sign-in" },
                {
                  onSuccess: () => {
                    setMessage("A fresh code was sent.");
                    setSentAt(Date.now());
                    setClock(Date.now());
                  },
                  onError: (context) => setError(context.error.message),
                },
              );

              setPending(false);
            }}
          >
            Resend code
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Code expires in {remainingLabel}
          </span>
        </div>
      </div>
    </form>
  );
}
