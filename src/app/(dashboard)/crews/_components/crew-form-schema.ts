import { z } from "zod";

export const CrewSchema = z
	.object({
		memberId: z.string().optional(),
		name: z.string().optional(),
		email: z.string().email("Invalid email").optional(),
		phoneNumber: z.string().optional(),
		equipment: z.array(z.string()).optional(),
		specialization: z
			.string()
			.min(1, { message: "Specialization is required" }),
		role: z.string().min(1, { message: "Role is required" }),
		status: z.string().min(1, { message: "Status is required" }),
	})
	.superRefine((data, ctx) => {
		// Either memberId or name must be provided
		if (!data.memberId && !data.name) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Either select a team member or provide a name",
				path: ["memberId"],
			});
		}
	});

export type CrewFormValues = z.infer<typeof CrewSchema>;

export const defaultCrew: CrewFormValues = {
	memberId: "",
	name: "",
	email: "",
	phoneNumber: "",
	equipment: [],
	specialization: "",
	role: "",
	status: "available",
};
