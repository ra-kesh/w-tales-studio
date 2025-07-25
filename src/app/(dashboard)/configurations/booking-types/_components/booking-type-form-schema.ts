import { z } from "zod/v4";

export const BookingTypeSchema = z.object({
	value: z.string().min(1, "Value is required"),
	metadata: z.object({
		roles: z.array(z.string()).optional(),
	}),
});

export type BookingTypeFormValues = z.infer<typeof BookingTypeSchema>;

export type BookingTypeMetadata = z.infer<
	typeof BookingTypeSchema.shape.metadata
>;

export const defaultBookingType: BookingTypeFormValues = {
	value: "",
	metadata: {
		roles: ["client", "other"],
	},
};
