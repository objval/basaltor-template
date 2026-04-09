import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/lib/db/schema/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://basaltor:basaltor@127.0.0.1:5432/basaltor",
  },
  strict: true,
  verbose: true,
});
