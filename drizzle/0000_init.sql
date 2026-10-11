CREATE SCHEMA IF NOT EXISTS "app";
--> statement-breakpoint
CREATE TYPE "app"."lead_channel" AS ENUM('site', 'whatsapp', 'olx', 'webmotors', 'mercadolivre', 'manual');--> statement-breakpoint
CREATE TYPE "app"."lead_status" AS ENUM('new', 'in_progress', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "app"."listing_status" AS ENUM('published', 'paused', 'removed', 'error');--> statement-breakpoint
CREATE TYPE "app"."marketplace" AS ENUM('olx', 'webmotors', 'mercadolivre');--> statement-breakpoint
CREATE TYPE "app"."user_role" AS ENUM('manager', 'seller');--> statement-breakpoint
CREATE TYPE "app"."vehicle_status" AS ENUM('available', 'reserved', 'sold');--> statement-breakpoint
CREATE TABLE "app"."leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"vehicle_id" integer,
	"seller_id" integer,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"message" text,
	"channel" "app"."lead_channel" NOT NULL,
	"status" "app"."lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL,
	"marketplace" "app"."marketplace" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" "app"."listing_status" DEFAULT 'removed' NOT NULL,
	"external_id" text,
	"synced_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"whatsapp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"primary_color" text DEFAULT '#dc2626' NOT NULL,
	"whatsapp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"store_id" integer,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" "app"."user_role" DEFAULT 'seller' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_assigned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"slug" text NOT NULL,
	"plate" text,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"version" text,
	"year" integer NOT NULL,
	"km" integer DEFAULT 0 NOT NULL,
	"price" integer NOT NULL,
	"fipe_price" integer,
	"color" text,
	"transmission" text,
	"fuel" text,
	"body_type" text,
	"description" text,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "app"."vehicle_status" DEFAULT 'available' NOT NULL,
	"stocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "app"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."leads" ADD CONSTRAINT "leads_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listings" ADD CONSTRAINT "listings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listings" ADD CONSTRAINT "listings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "app"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."stores" ADD CONSTRAINT "stores_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "app"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."vehicles" ADD CONSTRAINT "vehicles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."vehicles" ADD CONSTRAINT "vehicles_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "app"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_tenant_id_created_at_index" ON "app"."leads" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "leads_seller_id_index" ON "app"."leads" USING btree ("seller_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_vehicle_id_marketplace_index" ON "app"."listings" USING btree ("vehicle_id","marketplace");--> statement-breakpoint
CREATE INDEX "listings_tenant_id_index" ON "app"."listings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "stores_tenant_id_index" ON "app"."stores" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_tenant_id_index" ON "app"."users" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_tenant_id_slug_index" ON "app"."vehicles" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "vehicles_tenant_id_status_index" ON "app"."vehicles" USING btree ("tenant_id","status");