import { z } from "zod/v4";

export const receivedPaymentFormSchema = z.object({
	bookingId: z.string().min(1, {
        error: "Booking is required"
    }),
	amount: z.string().min(1, {
        error: "Amount is required"
    }),
	description: z.string().optional(),
	paidOn: z.string().min(1, {
        error: "Date is required"
    }),
});

export type ReceivedPaymentFormValues = z.infer<
	typeof receivedPaymentFormSchema
>;

export const defaultReceivedPayment: ReceivedPaymentFormValues = {
	bookingId: "",
	paidOn: "",
	amount: "",
	description: "",
};
