import { z } from "zod";

// First, create a decimal validator (reusing from booking form schema)
const DecimalString = z.string().transform((val, ctx) => {
  const cleaned = val.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must be a valid number",
    });
    return z.NEVER;
  }

  return parsed.toFixed(2);
});

export const DeliverableSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  bookingId: z.string().min(1, { message: "Booking is required" }),
  isPackageIncluded: z.boolean(),
  cost: DecimalString.optional(),
  quantity: DecimalString,
  dueDate: z.string().min(1, { message: "Due date is required" }),
  notes: z.string().optional(),
});

export type DeliverableFormValues = z.infer<typeof DeliverableSchema>;

export const defaultDeliverable: DeliverableFormValues = {
  title: "",
  bookingId: "",
  isPackageIncluded: true,
  cost: "0.00",
  quantity: "1",
  dueDate: "",
  notes: "",
};
