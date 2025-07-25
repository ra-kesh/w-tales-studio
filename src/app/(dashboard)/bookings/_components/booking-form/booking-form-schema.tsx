import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

// ————————————————————————————————
// Reusable “decimal in string form” type
// ————————————————————————————————
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

// ————————————————————————————————
// A single participant: name + role + optional contact info
// ————————————————————————————————
export const ParticipantSchema = z.object({
	name: z.string().min(1, "Name is required"),
	role: z.string().min(1, "Role is required"),
	phone: z.string().optional(),
	email: z.string().optional(),
	address: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

// ————————————————————————————————
// Main booking form schema
// ————————————————————————————————
export const BookingSchema = z.object({
	bookingName: z.string().min(1, "Booking Name is required"),
	bookingType: z.string().min(1, "Booking Type is required"),
	packageType: z.string().min(1, "Package Type is required"),
	packageCost: DecimalString,
	participants: z
		.array(ParticipantSchema)
		.min(1, "At least one participant is required"),
	note: z.string().optional(),
	shoots: z
		.array(
			z.object({
				title: z.string().min(1, "Title is required"),
				date: z.string().min(1, "Date is required"),
				time: z.string().min(1, "Time is required"),
				location: z.string().min(1, "Location is required"),
				crews: z.array(z.string()).optional(),
			}),
		)
		.optional(),
	deliverables: z
		.array(
			z.object({
				title: z.string().min(1, "Title is required"),
				cost: DecimalString,
				quantity: DecimalString,
				dueDate: z.string().optional(),
			}),
		)
		.optional(),
	payments: z
		.array(
			z.object({
				amount: DecimalString,
				description: z.string().optional(),
				date: z.string().min(1, "Payment date is required"),
			}),
		)
		.optional(),
	scheduledPayments: z
		.array(
			z.object({
				amount: DecimalString,
				description: z.string().optional(),
				dueDate: z.string().min(1, "Due date is required"),
			}),
		)
		.optional(),
});
export type BookingFormValues = z.infer<typeof BookingSchema>;

// ————————————————————————————————
// Default form values
// ————————————————————————————————
export const defaultBooking: BookingFormValues = {
	bookingName: "",
	bookingType: "",
	packageType: "",
	packageCost: "0.00",
	participants: [
		{
			name: "",
			role: "groom",
			phone: "",
			email: "",
			address: "",
			metadata: {},
		},
	],
	note: "",
	shoots: [],
	deliverables: [],
	payments: [],
	scheduledPayments: [],
};

export const formOpts = formOptions({
	defaultValues: defaultBooking,
});
