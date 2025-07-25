import { z } from "zod/v4";

export const scheduledPaymentFormSchema = z.object({
	bookingId: z.string().min(1, {
        error: "Booking is required"
    }),
	amount: z.string().min(1, {
        error: "Amount is required"
    }),
	description: z.string().optional(),
	dueDate: z.string().min(1, {
        error: "Due date is required"
    }),
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
