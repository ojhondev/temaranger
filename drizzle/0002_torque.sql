CREATE TYPE "app"."banner_placement" AS ENUM('hero', 'promo');--> statement-breakpoint
CREATE TYPE "app"."connection_status" AS ENUM('connected', 'disconnected');--> statement-breakpoint
ALTER TYPE "app"."user_role" ADD VALUE 'master' BEFORE 'manager';--> statement-breakpoint
CREATE TABLE "app"."banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"placement" "app"."banner_placement" DEFAULT 'hero' NOT NULL,
	"heading" text,
	"title" text NOT NULL,
	"subtitle" text,
	"cta_label" text,
	"href" text,
	"image_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."marketplace_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"marketplace" "app"."marketplace" NOT NULL,
	"status" "app"."connection_status" DEFAULT 'connected' NOT NULL,
	"account_name" text,
	"rules" jsonb DEFAULT '{"scope":"all"}'::jsonb NOT NULL,
	"connected_at" timestamp with time zone,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."users" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."tenants" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "app"."users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "app"."users" ADD COLUMN "tours_seen" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app"."banners" ADD CONSTRAINT "banners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."marketplace_accounts" ADD CONSTRAINT "marketplace_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banners_tenant_id_placement_index" ON "app"."banners" USING btree ("tenant_id","placement");--> statement-breakpoint
CREATE UNIQUE INDEX "marketplace_accounts_tenant_id_marketplace_index" ON "app"."marketplace_accounts" USING btree ("tenant_id","marketplace");--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");