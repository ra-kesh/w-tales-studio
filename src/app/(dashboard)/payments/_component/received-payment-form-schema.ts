import { z } from "zod";

export const receivedPaymentFormSchema = z.object({
	bookingId: z.string().min(1, { message: "Booking is required" }),
	amount: z.string().min(1, { message: "Amount is required" }),
	description: z.string().optional(),
	paidOn: z.string().min(1, { message: "Date is required" }),
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
