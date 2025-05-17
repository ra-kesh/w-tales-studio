import { z } from "zod";

export const TaskSchema = z.object({
	bookingId: z.string().min(1, { message: "Booking is required" }),
	description: z.string().min(1, { message: "Description is required" }),
	priority: z.enum(["low", "medium", "high", "critical"], {
		required_error: "Priority is required",
	}),
	status: z.enum(
		["todo", "in_progress", "in_review", "in_revision", "completed"],
		{
			required_error: "Status is required",
		},
	),
	dueDate: z.string().min(1, { message: "Due date is required" }),
	crewMembers: z.array(z.string()).optional(),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;

export const defaultTask: TaskFormValues = {
	bookingId: "",
	description: "",
	priority: "medium",
	status: "todo",
	dueDate: "",
	crewMembers: [],
};
