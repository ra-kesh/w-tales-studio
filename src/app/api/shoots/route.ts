import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ShootSchema } from "@/app/(dashboard)/shoots/_components/shoot-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	type AllowedShootSortFields,
	getShoots,
	type ShootFilters,
	type ShootSortOption,
} from "@/lib/db/queries";
import { bookings, crews, shoots, shootsAssignments } from "@/lib/db/schema";

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

	const canUpdate = await auth.api.hasPermission({
		headers: await headers(),
		body: { permissions: { shoot: ["list"] } },
	});
	if (!canUpdate) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);

		const sortParam = searchParams.get("sort");
		let sortOptions: ShootSortOption[] | undefined;
		if (sortParam) {
			try {
				const parsedSortOptions = JSON.parse(sortParam);
				const allowedFields: AllowedShootSortFields[] = [
					"title",
					"date",
					"createdAt",
					"updatedAt",
				];
				sortOptions = parsedSortOptions.filter(
					(option: { id: AllowedShootSortFields; desc: boolean }) =>
						allowedFields.includes(option.id),
				);
			} catch (error) {
				console.error("Error parsing sort parameter:", error);
			}
		}

		const filters: ShootFilters = {
			title: searchParams.get("title") || undefined,
			date: searchParams.get("date") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
			crew: searchParams.get("crew") || undefined, // This will be a string like "8,10"
		};

		const result = await getShoots(
			userOrganizationId,
			page,
			limit,
			sortOptions,
			filters,
		);
		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching shoots:", error);
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

	const userOrganizationId = session.session.activeOrganizationId;
	if (!userOrganizationId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	const body = await request.json();

	const validation = ShootSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.issues },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;
	const { bookingId, crewMembers, additionalDetails } = validatedData;

	if (!validatedData.bookingId) {
		return NextResponse.json(
			{ message: "Booking ID is required" },
			{ status: 400 },
		);
	}

	const numericBookingId = Number(bookingId);

	const bookingExists = await db.query.bookings.findFirst({
		where: and(
			eq(bookings.id, numericBookingId),
			eq(bookings.organizationId, userOrganizationId),
		),
	});
	if (!bookingExists) {
		return NextResponse.json({ message: "Booking not found" }, { status: 404 });
	}

	let crewAssignments: { crewId: number }[] = [];

	if (crewMembers && crewMembers.length > 0) {
		const crewIds = crewMembers.map(Number);
		const existingCrews = await db
			.select({ id: crews.id })
			.from(crews)
			.where(
				and(
					inArray(crews.id, crewIds),
					eq(crews.organizationId, userOrganizationId),
				),
			);

		if (existingCrews.length !== crewIds.length) {
			const foundCrewIds = new Set(existingCrews.map((c) => c.id));
			const invalidCrewIds = crewIds.filter((id) => !foundCrewIds.has(id));
			return NextResponse.json(
				{ message: "Invalid crew members provided.", invalidCrewIds },
				{ status: 400 },
			);
		}

		crewAssignments = crewIds.map((crewId) => ({ crewId: Number(crewId) }));
	}

	try {
		const result = await db.transaction(async (tx) => {
			const [newShoot] = await tx
				.insert(shoots)
				.values({
					bookingId: numericBookingId,
					organizationId: userOrganizationId,
					title: validatedData.title,
					date: validatedData.date,
					time: validatedData.time,
					location: validatedData.location,
					notes: validatedData.notes,
					additionalDetails: additionalDetails,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: shoots.id });

			const assignmentResults = [];
			if (crewAssignments.length > 0) {
				const assignmentValues = crewAssignments.map((assignment) => ({
					shootId: newShoot.id,
					crewId: assignment.crewId,
					organizationId: userOrganizationId,
					isLead: false,
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				const assignmentsInserted = await tx
					.insert(shootsAssignments)
					.values(assignmentValues)
					.returning({
						id: shootsAssignments.id,
						crewId: shootsAssignments.crewId,
					});

				assignmentResults.push(...assignmentsInserted);
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return [newShoot, updatedBooking, assignmentResults];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [newShoot, updatedBooking, assignmentResults] = result as [
			{ id: number },
			{ id: number },
			{ id: number; crewId: number }[],
		];

		return NextResponse.json(
			{
				data: {
					shootId: newShoot.id,
					bookingId: updatedBooking.id,
					assignments: assignmentResults,
				},
				message: "Shoot created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating shoot:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
