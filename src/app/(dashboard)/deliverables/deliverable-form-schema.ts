import { z } from "zod";

export const DeliverableSchema = z
	.object({
		title: z.string().min(1, { message: "Title is required" }),
		bookingId: z.string().min(1, { message: "Booking is required" }),
		notes: z.string().optional(),
		dueDate: z.string().min(1, { message: "Due date is required" }),
		isPackageIncluded: z.boolean(),
		quantity: z.string().min(1, { message: "Quantity is required" }),
		// Update cost validation to be conditional
		cost: z.string().refine((val) => {
			const num = Number.parseFloat(val);
			return !Number.isNaN(num) && num >= 0;
		}, "Must be a valid number"),
	})
	.superRefine((data, ctx) => {
		if (
			!data.isPackageIncluded &&
			(!data.cost || Number.parseFloat(data.cost) <= 0)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Cost is required when package is not included",
				path: ["cost"],
			});
		}
	});

export type DeliverableFormValues = z.infer<typeof DeliverableSchema>;

export const defaultDeliverable: DeliverableFormValues = {
	title: "",
	bookingId: "",
	notes: "",
	dueDate: "",
	isPackageIncluded: true,
	quantity: "1",
	cost: "0",
};
