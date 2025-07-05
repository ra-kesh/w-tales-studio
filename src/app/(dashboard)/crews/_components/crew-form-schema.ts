import { z } from "zod";

export const CrewSchema = z.object({
	name: z.string().optional(),
	email: z.string().email("Invalid email").optional(),
	phoneNumber: z.string().optional(),
	equipment: z.array(z.string()).optional(),
	specialization: z.string().optional(),
	role: z.string().optional(),
	status: z.string().min(1, { message: "Status is required" }),
});

export type CrewFormValues = z.infer<typeof CrewSchema>;

export const defaultCrew: CrewFormValues = {
	name: "",
	email: "",
	phoneNumber: "",
	equipment: [""],
	specialization: "",
	role: "crew",
	status: "available",
};
