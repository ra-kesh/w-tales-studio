import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { DeliverableSchema } from "@/app/(dashboard)/deliverables/deliverable-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	type AllowedDeliverableSortFields,
	type DeliverableFilters,
	type DeliverableSortOption,
	getDeliverables,
} from "@/lib/db/queries";
import {
	bookings,
	crews,
	deliverables,
	deliverablesAssignments,
} from "@/lib/db/schema";

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

		const sortParam = searchParams.get("sort");
		let sortOptions: DeliverableSortOption[] | undefined;
		if (sortParam) {
			try {
				const parsedSort = JSON.parse(sortParam);
				const allowedFields: AllowedDeliverableSortFields[] = [
					"title",
					"status",
					"dueDate",
					"createdAt",
					"updatedAt",
				];
				sortOptions = parsedSort.filter((option: DeliverableSortOption) =>
					allowedFields.includes(option.id),
				);
			} catch (e) {
				console.error("Failed to parse sort parameter:", e);
			}
		}

		// 2. Construct Filters Object from URL Search Params
		const filters: DeliverableFilters = {
			title: searchParams.get("title") || undefined,
			status: searchParams.get("status") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
			crewId: searchParams.get("crewId") || undefined,
			dueDate: searchParams.get("dueDate") || undefined,
		};

		const result = await getDeliverables(
			userOrganizationId,
			page,
			limit,
			sortOptions,
			filters,
		);

		// Todo: Look into this later , if deliverables assignment name is acting up weird

		// const transformedData = result.data.map((deliverable) => ({
		// 	...deliverable,
		// 	deliverablesAssignments: deliverable.deliverablesAssignments?.map(
		// 		(assignment) => ({
		// 			...assignment,
		// 			crew: {
		// 				...assignment.crew,
		// 				name: assignment.crew.member?.user?.name || assignment.crew.name,
		// 			},
		// 		}),
		// 	),
		// }));

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching deliverables:", error);
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

	const validation = DeliverableSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.issues },
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

			const [newDeliverable] = await tx
				.insert(deliverables)
				.values({
					bookingId: Number.parseInt(validatedData.bookingId),
					isPackageIncluded: validatedData.isPackageIncluded,
					title: validatedData.title,
					cost: validatedData.cost,
					quantity: Number.parseInt(validatedData.quantity),
					dueDate: validatedData.dueDate,
					notes: validatedData.notes,
					status: validatedData.status,
					organizationId: userOrganizationId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: deliverables.id });

			const assignmentResults = [];
			if (crewAssignments.length > 0) {
				const assignmentValues = crewAssignments.map((assignment) => ({
					deliverableId: newDeliverable.id,
					crewId: assignment.crewId,
					organizationId: userOrganizationId,
					isLead: false,
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				const assignmentsInserted = await tx
					.insert(deliverablesAssignments)
					.values(assignmentValues)
					.returning({
						id: deliverablesAssignments.id,
						crewId: deliverablesAssignments.crewId,
					});

				assignmentResults.push(...assignmentsInserted);
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, Number.parseInt(validatedData.bookingId)))
				.returning();

			return [newDeliverable, updatedBooking, assignmentResults];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [newDeliverable, updatedBooking, assignmentResults] = result as [
			{ id: number },
			{ id: number },
			{ id: number; crewId: number }[],
		];

		return NextResponse.json(
			{
				data: {
					deliverableId: newDeliverable.id,
					bookingId: updatedBooking.id,
					assignments: assignmentResults,
				},
				message: "Deliverable created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating deliverable:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
