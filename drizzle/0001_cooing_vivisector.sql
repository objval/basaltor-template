CREATE TYPE "public"."app_role" AS ENUM('owner', 'admin', 'member', 'customer');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'::"public"."app_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."app_role" USING "role"::"public"."app_role";