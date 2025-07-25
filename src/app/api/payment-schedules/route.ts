import { and, eq, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";
import { scheduledPaymentFormSchema } from "@/app/(dashboard)/payments/_component/scheduled-payment-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	type AllowedScheduledPaymentSortFields,
	getPaymentSchedules,
	type ScheduledPaymentFilters,
	type ScheduledPaymentSortOption,
} from "@/lib/db/queries";
import { bookings, paymentSchedules, receivedAmounts } from "@/lib/db/schema";

export async function GET(request: Request) {
	const { session } = await getServerSession();
	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const orgId = session.session.activeOrganizationId;
	if (!orgId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);

		const sortParam = searchParams.get("sort");

		let sortOptions: ScheduledPaymentSortOption[] | undefined;

		if (sortParam) {
			try {
				const parsedSort = JSON.parse(sortParam);
				const allowedFields: AllowedScheduledPaymentSortFields[] = [
					"amount",
					"dueDate",
					"createdAt",
				];
				sortOptions = parsedSort.filter((option: ScheduledPaymentSortOption) =>
					allowedFields.includes(option.id),
				);
			} catch (e) {
				console.error("Failed to parse sort parameter:", e);
			}
		}

		const filters: ScheduledPaymentFilters = {
			description: searchParams.get("description") || undefined,
			dueDate: searchParams.get("dueDate") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
		};

		const result = await getPaymentSchedules(
			orgId,
			page,
			limit,
			sortOptions,
			filters,
		);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching payment schedules:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const activeOrganizationId = session.session.activeOrganizationId;

	if (!activeOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}
	const canCreatePayment = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				payment: ["create"],
			},
		},
	});

	if (!canCreatePayment) {
		return NextResponse.json(
			{ message: "You do not have permission to add payments." },
			{ status: 403 },
		);
	}

	const body = await request.json();
	const validatedData = scheduledPaymentFormSchema.parse(body);
	const { bookingId, amount, description, dueDate } = validatedData;
	const numericBookingId = Number(bookingId);

	const bookingExists = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, Number(bookingId)),
			eq(bookings.organizationId, activeOrganizationId),
		),
	});
	if (!bookingExists) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	const [receivedTotalResult] = await db
		.select({ total: sum(receivedAmounts.amount) })
		.from(receivedAmounts)
		.where(eq(receivedAmounts.bookingId, numericBookingId));
	const [scheduledTotalResult] = await db
		.select({ total: sum(paymentSchedules.amount) })
		.from(paymentSchedules)
		.where(eq(paymentSchedules.bookingId, numericBookingId));

	const currentTotal =
		(Number(receivedTotalResult?.total) || 0) +
		(Number(scheduledTotalResult?.total) || 0);
	const newGrandTotal = currentTotal + parseFloat(amount);

	if (newGrandTotal > parseFloat(bookingExists.packageCost)) {
		return NextResponse.json(
			{ message: "Total of all payments cannot exceed the package cost." },
			{ status: 400 },
		);
	}

	try {
		const newScheduledPayment = await db
			.insert(paymentSchedules)
			.values({
				organizationId: activeOrganizationId,
				bookingId: Number(bookingId),
				amount,
				description: description || "N/a",
				dueDate: dueDate,
			})
			.returning();

		return NextResponse.json(newScheduledPayment[0], { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.issues }, { status: 400 });
		}
		console.error("Error creating scheduled payment:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
