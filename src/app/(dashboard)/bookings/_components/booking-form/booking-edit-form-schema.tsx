import { z } from "zod/v4";

// This schema ONLY defines the fields that can be edited.
export const BookingEditSchema = z.object({
	bookingName: z.string().min(1, "Booking name is required."),
	packageCost: z.string().min(1, "Package cost is required."),
	status: z.enum([
		"new",
		"preparation",
		"shooting",
		"delivery",
		"completed",
		"cancelled",
	]),
	note: z.string().optional(),
});

export type BookingEditFormValues = z.infer<typeof BookingEditSchema>;
