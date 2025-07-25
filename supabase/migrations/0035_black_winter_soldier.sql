ALTER TABLE "shoots" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shoots" ALTER COLUMN "time" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "client_organization_idx" ON "clients" USING btree ("organization_id");