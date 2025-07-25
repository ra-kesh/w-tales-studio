import { z } from "zod/v4";

export const DeliverableSchema = z
	.object({
		title: z.string().min(1, {
			error: "Title is required",
		}),
		bookingId: z.string().min(1, {
			error: "Booking is required",
		}),
		notes: z.string().optional(),
		dueDate: z.string().optional(),
		isPackageIncluded: z.boolean(),
		quantity: z.string().min(1, {
			error: "Quantity is required",
		}),
		status: z.string(),
		crewMembers: z.array(z.string()).optional(),
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
			ctx.issues.push({
				code: z.ZodIssueCode.custom,
				spath: ["cost"],
				error: "Cost is required when package is not included",
				input: "",
			});
		}
	});

export type DeliverableFormValues = z.infer<typeof DeliverableSchema>;

export const defaultDeliverable: DeliverableFormValues = {
	title: "",
	bookingId: "",
	notes: "",
	dueDate: "",
	status: "pending",
	crewMembers: [],
	isPackageIncluded: true,
	quantity: "1",
	cost: "0",
};
