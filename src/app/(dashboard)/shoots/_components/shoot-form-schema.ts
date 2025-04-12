import { z } from "zod";

export const ShootSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  bookingId: z.string().min(1, { message: "Booking is required" }),
  crewMembers: z
    .array(z.string())
    .min(1, { message: "At least one crew member is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  notes: z.string().optional(),
});

export type ShootFormValues = z.infer<typeof ShootSchema>;

export const defaultShoot: ShootFormValues = {
  title: "",
  bookingId: "",
  crewMembers: [],
  date: "",
  time: "",
  location: "",
  notes: "",
};
