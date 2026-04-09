import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { emailOTP } from "better-auth/plugins";

import { APP_NAME } from "@/lib/app-config";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/lib/db/client";
import { getServerEnv } from "@/lib/env";
import { sendAuthEmail, sendOtpEmail } from "@/lib/mailer";

const env = getServerEnv();

function getTrustedAuthOrigins(request?: Request) {
  const origins = new Set<string>([new URL(env.APP_URL).origin]);

  if (!request) {
    return Array.from(origins);
  }

  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // ignore malformed request URLs and keep the configured base origin only
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost && protocol) {
    origins.add(`${protocol}://${forwardedHost}`);
  }

  return Array.from(origins);
}

const socialProviders = {
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => getTrustedAuthOrigins(request),
  rateLimit: {
    enabled: true,
    storage: "memory",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 300,
        max: 3,
      },
      "/email-otp/send-verification-otp": {
        window: 300,
        max: 3,
      },
      "/sign-in/email-otp": {
        window: 300,
        max: 5,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders,
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "member",
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: ({ user, newEmail, url }) => {
        return sendAuthEmail({
          to: user.email,
          subject: "Confirm your new email",
          headline: "Approve email change",
          body: `You requested to change your email to ${newEmail}. Confirm the change using the secure link below.`,
          actionLabel: "Approve change",
          actionUrl: url,
        });
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: ({ user, url }) => {
      return sendAuthEmail({
        to: user.email,
        subject: "Verify your email",
        headline: "Verify your email",
        body: "Complete your registration by verifying this email address. This keeps the template secure from disposable signups and broken member accounts.",
        actionLabel: "Verify email",
        actionUrl: url,
      });
    },
    sendOnSignUp: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const path = ctx.path;
      const newSession = ctx.context.newSession;

      if (newSession && (path.startsWith("/sign-in") || path.startsWith("/sign-up"))) {
        const method = path.split("/").pop() ?? "unknown";
        const request = ctx.request;
        try {
          await writeAuditLog({
            actorUserId: newSession.user.id,
            action: path.startsWith("/sign-in") ? "auth.sign-in" : "auth.sign-up",
            resource: "session",
            details: {
              method,
              ip: request ? request.headers.get("x-forwarded-for") : null,
              userAgent: request ? request.headers.get("user-agent") : null,
            },
          });
        } catch (err: unknown) {
          console.error("[audit] auth log failed:", err);
        }
      }
    }),
  },
  plugins: [
    tanstackStartCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[emailOTP] Sending ${type} OTP to ${email}`);
        try {
          await sendOtpEmail({ to: email, otp, type });
          console.log(`[emailOTP] OTP sent to ${email}`);
        } catch (err: unknown) {
          console.error(`[emailOTP] Failed to send OTP to ${email}:`, err);
          throw err;
        }
      },
      rateLimit: {
        window: 300,
        max: 3,
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

// Better Auth 1.6 with multiple plugins may not infer additional fields on the client.
// This explicit type is used across the app to guarantee role availability.
export type AppUser = Session["user"] & { role: "owner" | "admin" | "member" };

export type AppSession = {
  user: AppUser;
  session: Session["session"];
};
