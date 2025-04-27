import { z } from "zod";

export const ExpenseSchema = z.object({
	amount: z.string().min(1, "Amount is required"),
	description: z.string().min(1, "Description is required"),
	date: z.string().min(1, "Date is required"),
	category: z.string().min(1, "Category is required"),
	billTo: z.enum(["Client", "Studio"]),
	bookingId: z.string().optional(),
	fileUrls: z.array(z.string()).optional(),
});

export type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

export const defaultExpense: ExpenseFormValues = {
	amount: "",
	description: "",
	date: "",
	category: "",
	billTo: "Studio",
	fileUrls: [],
};
