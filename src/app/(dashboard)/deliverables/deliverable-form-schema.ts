import { z } from "zod";

export const DeliverableSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  bookingId: z.string().min(1, { message: "Booking is required" }),
  notes: z.string().optional(),
  dueDate: z.string().min(1, { message: "Due Date is required" }),
  isPackageIncluded: z.boolean(),
  quantity: z.string(),
  cost: z.string(),
});

export type DeliverableFormValues = z.infer<typeof DeliverableSchema>;

export const defaultDeliverable: DeliverableFormValues = {
  title: "",
  bookingId: "",
  notes: "",
  dueDate: "",
  isPackageIncluded: true,
  quantity: "1",
  cost: "0",
};
