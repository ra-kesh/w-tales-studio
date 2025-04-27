import { z } from "zod";
import { BillTo, ExpenseCategory } from "@/lib/db/schema";

export const ExpenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  category: z.enum(Object.values(ExpenseCategory) as [string, ...string[]]),
  billTo: z.enum(Object.values(BillTo) as [string, ...string[]]),
  bookingId: z.string().min(1, "Booking is required"),
  fileUrls: z.array(z.string()).optional(),
});

export type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

export const defaultExpense: ExpenseFormValues = {
  amount: "",
  description: "",
  date: "",
  category: ExpenseCategory.CUSTOM,
  billTo: BillTo.STUDIO,
  bookingId: "",
  fileUrls: [],
};
