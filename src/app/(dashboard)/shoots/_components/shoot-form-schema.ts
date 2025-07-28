import { z } from "zod/v4";

export const ShootAdditionalDetailSchema = z.object({
	additionalServices: z.array(z.string()).optional(),
	requiredCrewCount: z.string().optional(),
});

export const ShootSchema = z.object({
	title: z.string().min(1, {
        error: "Title is required"
    }),
	bookingId: z.string().min(1, {
        error: "Booking is required"
    }),
	crewMembers: z.array(z.string()).optional(),
	date: z.string().optional(),
	time: z.string().optional(),
	location: z.string().optional(),
	notes: z.string().optional(),
	additionalDetails: ShootAdditionalDetailSchema.optional(),
});

export type ShootFormValues = z.infer<typeof ShootSchema>;

export const defaultShoot: ShootFormValues = {
	title: "",
	bookingId: "",
	crewMembers: [],
	date: "",
	time: "",
	location: "",
	notes: "",
	additionalDetails: {
		additionalServices: [],
		requiredCrewCount: "",
	},
};
