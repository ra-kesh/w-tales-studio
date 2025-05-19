import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const RelationType = z.union([
  z.literal("bride"),
  z.literal("groom"),
  z.literal("family"),
  z.literal("unknown"),
]);

export const DecimalString = z.string().transform((val, ctx) => {
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

export const BookingSchema = z.object({
  bookingName: z.string().min(1, "Booking Name is required"),
  bookingType: z.string().min(1, "Booking Type is required"),
  packageType: z.string().min(1, "Package Type is required"),
  packageCost: DecimalString,
  clientName: z.string().min(1, "Client Name is required"),
  brideName: z.string().min(1, "Bride Name is required"),
  groomName: z.string().min(1, "Groom Name is required"),
  note: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  relation: RelationType,
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional(),
  shoots: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        date: z.string().min(1, "Date is required"),
        time: z.string().min(1, "Time is required"),
        location: z.string().min(1, "location is required"),
        crews: z.array(z.string()).optional(),
      })
    )
    .optional(),
  deliverables: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        cost: DecimalString,
        quantity: DecimalString,
        dueDate: z.string().optional(),
      })
    )
    .optional(),
  payments: z
    .array(
      z.object({
        amount: DecimalString,
        description: z.string().optional(),
        date: z.string(),
      })
    )
    .optional(),
  scheduledPayments: z
    .array(
      z.object({
        amount: DecimalString,
        description: z.string(),
        dueDate: z.string(),
      })
    )
    .optional(),
});
export type BookingFormValues = z.infer<typeof BookingSchema>;

export const defaultBooking: BookingFormValues = {
  bookingName: "",
  bookingType: "WEDDING",
  packageType: "",
  packageCost: "0.00",
  clientName: "",
  brideName: "",
  groomName: "",
  relation: "unknown",
  phone: "",
  email: "",
  shoots: [],
  deliverables: [],
  payments: [],
  scheduledPayments: [],
  note: "",
  address: "",
};

export const formOpts = formOptions({
  defaultValues: defaultBooking,
});
