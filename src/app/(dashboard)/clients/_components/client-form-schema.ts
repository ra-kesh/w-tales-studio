import { z } from "zod";

export const ClientSchema = z.object({
	name: z.string().min(1, "Name is required"),
	phoneNumber: z.string().min(1, "Phone number is required"),
	email: z.string().email("Invalid email").optional().nullable(),
	address: z.string().min(1, "Address is required"),
});

export type ClientFormValues = z.infer<typeof ClientSchema>;

export const defaultClient: ClientFormValues = {
	name: "",
	phoneNumber: "",
	email: "",
	address: "",
};
