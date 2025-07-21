import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BookingSchema } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { getBookings, getBookingsStats } from "@/lib/db/queries";
import {
	bookingParticipants,
	bookings,
	clients,
	crews,
	deliverables,
	paymentSchedules,
	receivedAmounts,
	shoots,
	shootsAssignments,
} from "@/lib/db/schema";

export async function POST(request: Request) {
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

	const canCreateBooking = await auth.api.hasPermission({
		headers: await headers(),
		body: { permissions: { booking: ["create"] } },
	});
	if (!canCreateBooking) {
		return NextResponse.json(
			{ message: "You do not have permission to add booking." },
			{ status: 403 },
		);
	}

	const body = await request.json();
	const parse = BookingSchema.safeParse(body);
	if (!parse.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: parse.error.errors },
			{ status: 400 },
		);
	}
	const data = parse.data;

	const existingBooking = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.name, data.bookingName),
			eq(bookings.organizationId, orgId),
		),
	});
	if (existingBooking) {
		return NextResponse.json(
			{ message: "A booking with this name already exists." },
			{ status: 409 },
		);
	}

	const totalReceived =
		data.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) ?? 0;
	const totalScheduled =
		data.scheduledPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) ??
		0;
	const packageCost = parseFloat(data.packageCost);
	if (totalReceived + totalScheduled > packageCost) {
		return NextResponse.json(
			{ message: "The sum of all payments cannot exceed the package cost." },
			{ status: 400 },
		);
	}

	if (data.shoots?.length) {
		const allCrewIds = Array.from(
			new Set(
				data.shoots
					.flatMap((s) => s.crews ?? [])
					.map((id) => Number.parseInt(id, 10))
					.filter((n) => !Number.isNaN(n)),
			),
		);
		if (allCrewIds.length) {
			const existingCrews = await db
				.select({ id: crews.id })
				.from(crews)
				.where(
					and(inArray(crews.id, allCrewIds), eq(crews.organizationId, orgId)),
				);
			const foundCrewIds = new Set(existingCrews.map((c) => c.id));
			const invalidCrewIds = allCrewIds.filter((id) => !foundCrewIds.has(id));
			if (invalidCrewIds.length > 0) {
				return NextResponse.json(
					{ message: "Invalid crew IDs provided.", invalid: invalidCrewIds },
					{ status: 400 },
				);
			}
		}
	}

	try {
		const newBookingId = await db.transaction(async (tx) => {
			const [bk] = await tx
				.insert(bookings)
				.values({
					organizationId: orgId,
					name: data.bookingName,
					bookingType: data.bookingType,
					packageType: data.packageType,
					packageCost: data.packageCost,
					note: data.note,
				})
				.returning({ id: bookings.id });
			const bookingId = bk.id;

			for (const p of data.participants) {
				const [cl] = await tx
					.insert(clients)
					.values({
						organizationId: orgId,
						name: p.name,
						phoneNumber: p.phone,
						email: p.email,
						address: p.address,
						metadata: p.metadata,
					})
					.returning({ id: clients.id });
				await tx.insert(bookingParticipants).values({
					bookingId,
					clientId: cl.id,
					role: p.role,
				});
			}

			if (data.shoots?.length) {
				const insertedShoots = await tx
					.insert(shoots)
					.values(
						data.shoots.map((s) => ({
							bookingId,
							organizationId: orgId,
							title: s.title,
							date: s.date,
							time: s.time ?? "",
							location: s.location,
							// notes: s.notes,
						})),
					)
					.returning({ id: shoots.id });
				const assigns = data.shoots.flatMap((s, i) =>
					(s.crews ?? []).map((cid) => ({
						shootId: insertedShoots[i].id,
						crewId: Number.parseInt(cid, 10),
						organizationId: orgId,
						isLead: false,
					})),
				);
				if (assigns.length) {
					await tx.insert(shootsAssignments).values(assigns);
				}
			}

			if (data.deliverables?.length) {
				await tx.insert(deliverables).values(
					data.deliverables.map((d) => ({
						bookingId,
						organizationId: orgId,
						title: d.title,
						isPackageIncluded: true,
						cost: d.cost,
						quantity: Number.parseInt(d.quantity, 10),
						dueDate: d.dueDate,
					})),
				);
			}

			if (data.payments?.length) {
				await tx.insert(receivedAmounts).values(
					data.payments.map((pmt) => ({
						bookingId,
						organizationId: orgId,
						amount: pmt.amount,
						description: pmt.description,
						paidOn: pmt.date,
					})),
				);
			}

			if (data.scheduledPayments?.length) {
				await tx.insert(paymentSchedules).values(
					data.scheduledPayments.map((sch) => ({
						bookingId,
						organizationId: orgId,
						amount: sch.amount,
						description: sch.description,
						dueDate: sch.dueDate,
					})),
				);
			}

			return bookingId;
		});

		return NextResponse.json(
			{
				data: { bookingId: newBookingId },
				message: "Booking created successfully",
			},
			{ status: 201 },
		);
	} catch (err) {
		console.error("Error during booking transaction:", err);
		return NextResponse.json(
			{ message: "Internal server error during database operation" },
			{ status: 500 },
		);
	}
}

type AllowedSortFields =
	| "name"
	| "createdAt"
	| "updatedAt"
	| "packageCost"
	| "bookingType"
	| "status";

type SortOption = {
	id: AllowedSortFields;
	desc: boolean;
};

interface BookingFilters {
	packageType?: string;
	createdAt?: string;
	name?: string;
}

export async function GET(request: Request) {
	const { session } = await getServerSession();

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

	const canReadBooking = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				booking: ["read"],
			},
		},
	});

	if (!canReadBooking) {
		return NextResponse.json(
			{ message: "You do not have permission to add booking." },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);
		const name = searchParams.get("name") || undefined;

		const sortParam = searchParams.get("sort");
		let sortOptions: SortOption[] | undefined;

		if (sortParam) {
			try {
				const parsedSortOptions = JSON.parse(sortParam);
				// Validate and filter sort options
				const allowedFields: AllowedSortFields[] = [
					"name",
					"createdAt",
					"updatedAt",
					"packageCost",
					"bookingType",
					"status",
				];
				sortOptions = parsedSortOptions.filter(
					(option: { id: AllowedSortFields; desc: boolean }) => {
						if (!option.id || !allowedFields.includes(option.id)) {
							console.warn(`Invalid sort field: ${option.id}`);
							return false;
						}
						return true;
					},
				);
			} catch (error) {
				console.error("Error parsing sort parameter:", error);
			}
		}

		// Extract filter parameters
		const filters: BookingFilters = {
			packageType: searchParams.get("packageType") || undefined,
			createdAt: searchParams.get("createdAt") || undefined,
			name: name || undefined,
		};

		const result = await getBookings(
			userOrganizationId,
			page,
			limit,
			sortOptions,
			filters,
		);

		const stats = await getBookingsStats(userOrganizationId);

		return NextResponse.json(
			{
				...result,
				stats,
			},
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error fetching bookings:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
