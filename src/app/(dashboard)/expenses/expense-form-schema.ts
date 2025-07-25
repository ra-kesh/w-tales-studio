import { z } from "zod/v4";
import { BillTo } from "@/lib/db/schema";

export const ExpenseSchema = z.object({
	amount: z.string().min(1, "Amount is required"),
	description: z.string().min(1, "Description is required"),
	date: z.string().min(1, "Date is required"),
	category: z.string().min(1, "Category is required"),
	billTo: z.enum(BillTo.enumValues as [string, ...string[]]),
	bookingId: z.string().min(1, "Booking is required"),
	fileUrls: z.array(z.string()).optional(),
	crewMembers: z.array(z.string()).optional(),
});

export type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

export const defaultExpense: ExpenseFormValues = {
	amount: "",
	description: "",
	date: "",
	category: "miscellaneous",
	billTo: BillTo.enumValues[0],
	bookingId: "",
	fileUrls: [],
	crewMembers: [],
};
