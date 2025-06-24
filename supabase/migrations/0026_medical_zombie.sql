ALTER TYPE "public"."config_type" ADD VALUE 'deliverable_status';--> statement-breakpoint
ALTER TYPE "public"."config_type" ADD VALUE 'deliverable_priority';--> statement-breakpoint
CREATE TABLE "booking_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_participants_uniq_idx" ON "booking_participants" USING btree ("booking_id","client_id","role");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "bride_name";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "groom_name";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "relation";--> statement-breakpoint
DROP TYPE "public"."relation_type";