import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const ContactMethod = z.union([
	z.literal("email"),
	z.literal("phone"),
	z.literal("whatsapp"),
]);
export type ContactMethod = z.infer<typeof ContactMethod>;

export const ContactMethods = ContactMethod.options.map(({ value }) => ({
	value,
	label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const RelationType = z.union([
	z.literal("bride"),
	z.literal("groom"),
	z.literal("father"),
	z.literal("mother"),
	z.literal("brother"),
	z.literal("sister"),
	z.literal("cousin"),
	z.literal("other"),
]);

export type RelationType = z.infer<typeof RelationType>;

export const RelationTypes = RelationType.options.map(({ value }) => ({
	value,
	label: value.charAt(0).toUpperCase() + value.slice(1),
}));

// First, create a decimal validator
export const DecimalString = z.string().transform((val, ctx) => {
	// Remove any non-numeric characters except decimal point
	const cleaned = val.replace(/[^\d.]/g, "");
	const parsed = Number.parseFloat(cleaned);

	if (Number.isNaN(parsed)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Must be a valid number",
		});
		return z.NEVER;
	}

	// Format to 2 decimal places
	return parsed.toFixed(2);
});

export const BookingSchema = z.object({
	bookingName: z.string().min(1, "Booking name is required"),
	bookingType: z.string().min(1, "Booking type is required"),
	packageType: z.string().min(1, "Package type is required"),
	packageCost: DecimalString,
	clientName: z.string().min(1, "Client name is required"),
	relation: RelationType.optional(),
	phone: z.string().min(1, "Phone number is required"),
	email: z.string().email("Invalid email address").optional(),
	shoots: z.array(
		z.object({
			title: z.string().min(1, "Title is required"),
			date: z.string().min(1, "Date is required"),
			time: z.string().min(1, "Time is required"),
			city: z.string().min(1, "City is required"),
		}),
	),
	deliverables: z.array(
		z.object({
			title: z.string().min(1, "Title is required"),
			cost: DecimalString,
			quantity: DecimalString,
			dueDate: z.string().min(1, "Due date is required"),
		}),
	),
	payments: z.array(
		z.object({
			amount: DecimalString,
			description: z.string().optional(),
			date: z.string(),
		}),
	),
	scheduledPayments: z.array(
		z.object({
			amount: DecimalString,
			description: z.string().min(1, "Description is required"),
			dueDate: z.string().min(1, "Due date is required"),
		}),
	),
	receivedAmount: DecimalString,
	dueDate: z.string().min(1, "Due date is required"),
	contactMethod: ContactMethod,
});
export type Booking = z.infer<typeof BookingSchema>;

export const defaultBooking: Booking = {
	bookingName: "",
	bookingType: "",
	packageType: "",
	packageCost: "0.00",
	clientName: "",
	relation: undefined,
	phone: "",
	email: "",
	shoots: [],
	deliverables: [],
	payments: [],
	scheduledPayments: [],
	receivedAmount: "",
	dueDate: "",
	contactMethod: "phone",
};

export const formOpts = formOptions({
	defaultValues: defaultBooking,
});
