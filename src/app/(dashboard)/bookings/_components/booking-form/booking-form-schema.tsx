import { formOptions } from "@tanstack/react-form";
import { z } from "zod/v4";

export const DecimalString = z.string().transform((val, ctx) => {
	const cleaned = val.replace(/[^\d.]/g, "");
	const parsed = Number.parseFloat(cleaned);
	if (Number.isNaN(parsed)) {
		ctx.issues.push({
			code: z.ZodIssueCode.custom,
			error: "Must be a valid number",
			input: "",
		});
		return z.NEVER;
	}
	return parsed.toFixed(2);
});

export const ParticipantSchema = z.object({
	name: z.string().min(1, "Name is required"),
	role: z.string().min(1, "Role is required"),
	phone: z.string().optional(),
	email: z.string().optional(),
	address: z.string().optional(),
	metadata: z.record(z.string(), z.any()).optional(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

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
				date: z.string().optional(),
				time: z.string().optional(),
				location: z.string().optional(),
				notes: z.string().optional(),
				additionalDetails: z
					.object({
						additionalServices: z.array(z.string()).optional(),
						requiredCrewCount: z.string().optional(),
					})
					.optional(),
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
