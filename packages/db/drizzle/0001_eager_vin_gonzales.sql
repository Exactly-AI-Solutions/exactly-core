CREATE TABLE "handoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"share_token" text NOT NULL,
	"context" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "handoffs_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_handoffs_tenant" ON "handoffs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_handoffs_share_token" ON "handoffs" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "idx_handoffs_expires_at" ON "handoffs" USING btree ("expires_at");