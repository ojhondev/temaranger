CREATE TABLE "app"."demo_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsapp" text NOT NULL,
	"contact_name" text,
	"dealership" text,
	"city" text,
	"primary_color" text,
	"logo_url" text,
	"tenant_id" integer,
	"stage" text DEFAULT 'captured' NOT NULL,
	"vehicles_added" integer DEFAULT 0 NOT NULL,
	"torque_opened_at" timestamp with time zone,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."tenants" ADD COLUMN "sandbox" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."tenants" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app"."demo_leads" ADD CONSTRAINT "demo_leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demo_leads_created_at_index" ON "app"."demo_leads" USING btree ("created_at");