ALTER TABLE "app"."tenants" ADD COLUMN "theme" text DEFAULT 'ranger' NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."tenants" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."tenants" ADD COLUMN "domain_verified_at" timestamp with time zone;