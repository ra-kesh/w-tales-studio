import { z } from "zod";

export const BookingSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type BookingFormValues = z.infer<typeof BookingSchema>;

export const defaultBookingType: BookingFormValues = {
  value: "",
};