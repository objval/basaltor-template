DO $$ BEGIN
 CREATE TYPE "public"."order_customer_mode" AS ENUM('account', 'guest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_mode" "order_customer_mode" DEFAULT 'account' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_email" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_contact_handle" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_country" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_access_token_hash" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_from_ip" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_from_user_agent" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_from_referrer" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_from_accept_language" text;--> statement-breakpoint
UPDATE "orders" AS o
SET
  "customer_mode" = CASE WHEN o."user_id" IS NULL THEN 'guest'::"order_customer_mode" ELSE 'account'::"order_customer_mode" END,
  "customer_name" = COALESCE(NULLIF(u."name", ''), split_part(COALESCE(u."email", o."guest_email", ''), '@', 1), ''),
  "customer_email" = COALESCE(u."email", o."guest_email", '')
FROM "users" AS u
WHERE o."user_id" = u."id";--> statement-breakpoint
UPDATE "orders"
SET
  "customer_mode" = CASE WHEN "user_id" IS NULL THEN 'guest'::"order_customer_mode" ELSE 'account'::"order_customer_mode" END,
  "customer_name" = CASE WHEN "customer_name" = '' THEN split_part(COALESCE("guest_email", "customer_email", ''), '@', 1) ELSE "customer_name" END,
  "customer_email" = CASE WHEN "customer_email" = '' THEN COALESCE("guest_email", '') ELSE "customer_email" END
WHERE "customer_email" = '' OR "customer_name" = '';--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "guest_email";--> statement-breakpoint
CREATE INDEX "orders_customer_email_idx" ON "orders" USING btree ("customer_email","created_at");
