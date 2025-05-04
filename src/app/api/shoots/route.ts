import { NextResponse } from "next/server";
import { getShoots } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { shoots, bookings, crews, assignments } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ShootSchema } from "@/app/(dashboard)/shoots/_components/shoot-form-schema";

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

	try {
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
		const result = await getShoots(userOrganizationId, page, limit);
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
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	try {
		const result = await db.transaction(async (tx) => {
			const existingBooking = await tx.query.bookings.findFirst({
				where: and(
					eq(bookings.id, Number.parseInt(validatedData.bookingId)),
					eq(bookings.organizationId, userOrganizationId),
				),
			});

			if (!existingBooking) {
				return NextResponse.json(
					{ message: "Booking not found or access denied" },
					{ status: 404 },
				);
			}

			let crewAssignments: { crewId: number }[] = [];
			if (validatedData.crewMembers && validatedData.crewMembers.length > 0) {
				const crewIds = validatedData.crewMembers;

				const existingCrews = await tx
					.select({ id: crews.id })
					.from(crews)
					.where(
						and(
							inArray(crews.id, crewIds.map(Number)),
							eq(crews.organizationId, userOrganizationId),
						),
					);

				const foundCrewIds = new Set(existingCrews.map((crew) => crew.id));
				const invalidCrewIds = crewIds.filter(
					(id) => !foundCrewIds.has(Number(id)),
				);

				if (invalidCrewIds.length > 0) {
					return NextResponse.json(
						{
							message: "Invalid crew members",
							invalidCrewIds,
						},
						{ status: 400 },
					);
				}

				crewAssignments = crewIds.map((crewId) => ({ crewId: Number(crewId) }));
			}

			const [newShoot] = await tx
				.insert(shoots)
				.values({
					bookingId: Number.parseInt(validatedData.bookingId),
					organizationId: userOrganizationId,
					title: validatedData.title,
					date: validatedData.date,
					time: validatedData.time,
					location: validatedData.location,
					notes: validatedData.notes,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: shoots.id });

			const assignmentResults = [];
			if (crewAssignments.length > 0) {
				const assignmentValues = crewAssignments.map((assignment) => ({
					crewId: assignment.crewId,
					entityType: "shoot",
					entityId: newShoot.id,
					organizationId: userOrganizationId,
					isLead: false, // You can make this configurable if needed
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				const assignmentsInserted = await tx
					.insert(assignments)
					.values(assignmentValues)
					.returning({ id: assignments.id, crewId: assignments.crewId });

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
