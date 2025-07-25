import { z } from "zod/v4";

export const TaskSchema = z.object({
	bookingId: z.string().min(1, {
        error: "Booking is required"
    }),
	description: z.string().min(1, {
        error: "Description is required"
    }),
	priority: z.enum(["low", "medium", "high", "critical"], {
        error: (issue) => issue.input === undefined ? "Priority is required" : undefined
    }),
	status: z.enum(
		["todo", "in_progress", "in_review", "in_revision", "completed"],
		{
            error: (issue) => issue.input === undefined ? "Status is required" : undefined
        },
	),
	dueDate: z.string().min(1, {
        error: "Due date is required"
    }),
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
