import { z } from "zod/v4";

export const UploadedAttachmentSchema = z.object({
	name: z.string(),
	size: z.number(),
	type: z.string(),
	key: z.string(),
	url: z.string(),
});
export type UploadedAttachment = z.infer<typeof UploadedAttachmentSchema>;

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
	attachment: UploadedAttachmentSchema.optional().nullable(),
});

export type ReceivedPaymentFormValues = z.infer<
	typeof receivedPaymentFormSchema
>;

export const defaultReceivedPayment: ReceivedPaymentFormValues = {
	bookingId: "",
	paidOn: "",
	amount: "",
	description: "",
	attachment: null,
};
