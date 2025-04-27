import { z } from "zod";

export const TaskSchema = z.object({
	bookingId: z.string().min(1, { message: "Booking is required" }),
	// deliverableId: z.string().optional(),
	description: z.string().min(1, { message: "Description is required" }),
	assignedTo: z.string().optional(),
	priority: z.string().min(1, { message: "Priority is required" }),
	status: z.string().min(1, { message: "Status is required" }),
	dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;

export const defaultTask: TaskFormValues = {
	bookingId: "",
	// deliverableId: "",
	description: "",
	assignedTo: "",
	priority: "",
	status: "Todo",
	dueDate: "",
};
