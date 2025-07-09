import { z } from "zod";

export const scheduledPaymentFormSchema = z.object({
	bookingId: z.string().min(1, { message: "Booking is required" }),
	amount: z.string().min(1, { message: "Amount is required" }),
	description: z.string().optional(),
	dueDate: z.string().min(1, { message: "Due date is required" }),
});

export const updateScheduledPaymentSchema = scheduledPaymentFormSchema.extend({
	id: z.number(),
});

export type ScheduledPaymentFormValues = z.infer<
	typeof scheduledPaymentFormSchema
>;

export const defaultScheduledPayment: ScheduledPaymentFormValues = {
	bookingId: "",
	dueDate: "",
	amount: "",
	description: "",
};
