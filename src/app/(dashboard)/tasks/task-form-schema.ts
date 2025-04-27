import { z } from "zod";

export const TaskSchema = z.object({
	bookingId: z.string().min(1, { message: "Booking is required" }),
	description: z.string().min(1, { message: "Description is required" }),
	assignedTo: z.string().optional(),
	priority: z.string().min(1, { message: "Priority is required" }),
	status: z.string().min(1, { message: "Status is required" }),
	dueDate: z.string().min(1, { message: "Due date is required" }),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;

export const defaultTask: TaskFormValues = {
	bookingId: "",
	description: "",
	assignedTo: "",
	priority: "",
	status: "Todo",
	dueDate: "",
};
