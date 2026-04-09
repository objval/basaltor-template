import { z } from "zod";

import { siteConfig } from "@/config/site";

const DEFAULT_DEV_SECRET = "dev-only-change-me-dev-only-change-me";
const DEFAULT_DATABASE_URL = "postgres://basaltor:basaltor@127.0.0.1:5432/basaltor";
const DEFAULT_SMTP_FROM = `${siteConfig.name} <${siteConfig.supportEmail.replace(/^[^@]+@/, "noreply@")}>`;

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url().default("http://127.0.0.1:3000"),
  DATABASE_URL: z.string().min(1).default(DEFAULT_DATABASE_URL),
  BETTER_AUTH_SECRET: z.string().min(32).default(DEFAULT_DEV_SECRET),
  SMTP_HOST: z.string().min(1).default("127.0.0.1"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z
    .enum(["true", "false", "1", "0", ""])
    .default("false")
    .transform((v) => v === "true" || v === "1"),
  SMTP_IGNORE_TLS: z
    .enum(["true", "false", "1", "0", ""])
    .default("true")
    .transform((v) => v === "true" || v === "1"),
  SMTP_FROM: z.string().min(1).default(DEFAULT_SMTP_FROM),
  MAILPIT_UI_URL: z.string().url().default("http://127.0.0.1:8025"),
  DISABLE_TRANSACTIONAL_EMAILS: z.coerce.boolean().default(false),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.parse(input);

  if (parsed.NODE_ENV === "production") {
    if (parsed.BETTER_AUTH_SECRET === DEFAULT_DEV_SECRET) {
      throw new Error("BETTER_AUTH_SECRET must be changed in production.");
    }

    if (parsed.APP_URL === "http://127.0.0.1:3000") {
      throw new Error("APP_URL must be configured explicitly in production.");
    }

    if (parsed.DATABASE_URL === DEFAULT_DATABASE_URL) {
      throw new Error("DATABASE_URL must be configured explicitly in production.");
    }

    if (parsed.SMTP_IGNORE_TLS) {
      throw new Error("SMTP_IGNORE_TLS must be false in production.");
    }
  }

  return parsed;
}

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = parseServerEnv(process.env);
  }

  return cachedEnv;
}
