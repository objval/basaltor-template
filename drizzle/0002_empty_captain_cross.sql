ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
UPDATE "users" SET "role" = 'member' WHERE "role" = 'customer';--> statement-breakpoint
DROP TYPE "public"."app_role";--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."app_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."app_role" USING "role"::"public"."app_role";