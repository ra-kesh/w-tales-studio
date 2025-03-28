import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import {
	bookings,
	clients,
	shoots,
	deliverables,
	receivedAmounts,
	paymentSchedules,
	expenses,
	crew,
	tasks,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userOrganizationId = session.session.activeOrganizationId;

	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	try {
		const { id } = await params;
		const bookingId = Number.parseInt(id, 10);

		// Fetch the booking with client data
		const bookingData = await db
			.select({
				id: bookings.id,
				organizationId: bookings.organizationId,
				name: bookings.name,
				bookingType: bookings.bookingType,
				packageType: bookings.packageType,
				packageCost: bookings.packageCost,
				client: {
					id: clients.id,
					name: clients.name,
					brideName: clients.brideName,
					groomName: clients.groomName,
					phoneNumber: clients.phoneNumber,
					email: clients.email,
					locations: clients.locations,
				},
				createdAt: bookings.createdAt,
				updatedAt: bookings.updatedAt,
			})
			.from(bookings)
			.leftJoin(clients, eq(bookings.clientId, clients.id))
			.where(
				and(
					eq(bookings.id, bookingId),
					eq(bookings.organizationId, userOrganizationId),
				),
			);

		if (bookingData.length === 0) {
			return NextResponse.json(
				{ message: "Booking not found" },
				{ status: 404 },
			);
		}

		const booking = bookingData[0];

		// Fetch related data separately
		const shootsData = await db
			.select()
			.from(shoots)
			.where(eq(shoots.bookingId, bookingId));

		const deliverablesData = await db
			.select()
			.from(deliverables)
			.where(eq(deliverables.bookingId, bookingId));

		const receivedAmountsData = await db
			.select()
			.from(receivedAmounts)
			.where(eq(receivedAmounts.bookingId, bookingId));

		const paymentSchedulesData = await db
			.select()
			.from(paymentSchedules)
			.where(eq(paymentSchedules.bookingId, bookingId));

		const expensesData = await db
			.select()
			.from(expenses)
			.where(eq(expenses.bookingId, bookingId));

		const crewData = await db
			.select()
			.from(crew)
			.where(eq(crew.bookingId, bookingId));

		const tasksData = await db
			.select()
			.from(tasks)
			.where(eq(tasks.bookingId, bookingId));

		// Combine the data into the response
		const response = {
			...booking,
			shoots: shootsData,
			deliverables: deliverablesData,
			receivedAmounts: receivedAmountsData,
			paymentSchedules: paymentSchedulesData,
			expenses: expensesData,
			crew: crewData,
			tasks: tasksData,
		};

		return NextResponse.json(response, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching booking:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
