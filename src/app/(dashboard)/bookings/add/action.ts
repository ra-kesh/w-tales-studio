// action.ts
"use server";

import {
	ServerValidateError,
	createServerValidate,
} from "@tanstack/react-form/nextjs";
import { formOpts } from "./_components/booking-form-schema";
import { configurations } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";
import { and, eq } from "drizzle-orm";

const serverValidate = createServerValidate({
	...formOpts,
	onServerValidate: async ({ value }) => {
		const [bookingType, packageType] = await Promise.all([
			db.query.configurations.findFirst({
				where: and(
					eq(configurations.type, "booking_type"),
					eq(configurations.key, value.bookingType),
				),
			}),
			db.query.configurations.findFirst({
				where: and(
					eq(configurations.type, "package_type"),
					eq(configurations.key, value.packageType),
				),
			}),
		]);

		if (!bookingType) {
			return "Invalid booking type";
		}

		if (!packageType) {
			return "Invalid package type";
		}

		// Validate package cost is a valid decimal
		const packageCost = Number.parseFloat(value.packageCost);
		if (Number.isNaN(packageCost) || packageCost <= 0) {
			return "Invalid package cost";
		}

		// Validate phone number format
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;
		if (!phoneRegex.test(value.phone.replace(/\s+/g, ""))) {
			return "Invalid phone number format";
		}

		// If email is provided, validate email format
		if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
			return "Invalid email format";
		}

		// Validate arrays have required fields
		if (
			value.shoots.some(
				(shoot) => !shoot.title || !shoot.date || !shoot.time || !shoot.city,
			)
		) {
			return "Invalid shoot details";
		}

		if (
			value.deliverables.some(
				(del) => !del.title || !del.cost || !del.quantity || !del.dueDate,
			)
		) {
			return "Invalid deliverable details";
		}
	},
});

export default async function someAction(prev: unknown, formData: FormData) {
	try {
		const validatedData = await serverValidate(formData);
		console.log("validatedData", validatedData);
		// Persist the form data to the database
		// await sql`
		//   INSERT INTO users (name, email, password)
		//   VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.password})
		// `
	} catch (e) {
		if (e instanceof ServerValidateError) {
			return e.formState;
		}

		// Some other error occurred while validating your form
		throw e;
	}

	// Your form has successfully validated!
}
