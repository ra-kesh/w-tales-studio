ALTER TABLE "crew" RENAME TO "crews";--> statement-breakpoint
ALTER TABLE "crews" DROP CONSTRAINT "crew_booking_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "crews" DROP CONSTRAINT "crew_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "crews" ADD CONSTRAINT "crews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crews" ADD CONSTRAINT "crews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;