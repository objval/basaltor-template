CREATE TABLE IF NOT EXISTS "passkeys" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "credential_id" text NOT NULL,
  "public_key" text NOT NULL,
  "counter" integer NOT NULL DEFAULT 0,
  "transports" text,
  "authenticator_attachment" text,
  "name" text,
  "created_at" timestamp with time zone,
  "aaguid" text,
  "credential_backed_up" boolean DEFAULT false,
  "credential_device_type" text,
  CONSTRAINT "passkeys_credential_id_unique" UNIQUE("credential_id"),
  CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "passkeys_user_id_idx" ON "passkeys" ("user_id");
