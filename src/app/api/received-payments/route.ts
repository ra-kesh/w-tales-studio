import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { receivedPaymentFormSchema } from "@/app/(dashboard)/payments/_component/received-payment-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	type AllowedReceivedPaymentSortFields,
	getReceivedPayments,
	type ReceivedPaymentFilters,
	type ReceivedPaymentSortOption,
} from "@/lib/db/queries";
import { bookings, receivedAmounts } from "@/lib/db/schema";

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

		let sortOptions: ReceivedPaymentSortOption[] | undefined;

		if (sortParam) {
			try {
				const parsedSort = JSON.parse(sortParam);
				const allowedFields: AllowedReceivedPaymentSortFields[] = [
					"amount",
					"paidOn",
					"createdAt",
				];
				sortOptions = parsedSort.filter((option: ReceivedPaymentSortOption) =>
					allowedFields.includes(option.id),
				);
			} catch (e) {
				console.error("Failed to parse sort parameter:", e);
			}
		}

		const filters: ReceivedPaymentFilters = {
			description: searchParams.get("description") || undefined,
			paidOn: searchParams.get("paidOn") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
			invoiceId: searchParams.get("invoiceId") || undefined,
		};

		const result = await getReceivedPayments(
			orgId,
			page,
			limit,
			sortOptions,
			filters,
		);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching received payments:", error);
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

	try {
		const body = await request.json();
		// 3. Validation: Parse the request body with Zod
		const validatedData = receivedPaymentFormSchema.parse(body);

		const { bookingId, amount, description, paidOn } = validatedData;

		const bookingExists = await db.query.bookings.findFirst({
			where: and(
				eq(bookings.id, Number(bookingId)),
				eq(bookings.organizationId, activeOrganizationId),
			),
		});

		if (!bookingExists) {
			return NextResponse.json(
				{
					message: "Booking not found or does not belong to this organization.",
				},
				{ status: 404 },
			);
		}

		const newPayment = await db
			.insert(receivedAmounts)
			.values({
				organizationId: activeOrganizationId,
				bookingId: Number(bookingId),
				amount,
				description: description || "N/a",
				paidOn: paidOn,
			})
			.returning();

		return NextResponse.json(newPayment[0], { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.errors }, { status: 400 });
		}
		console.error("Error creating received payment:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
