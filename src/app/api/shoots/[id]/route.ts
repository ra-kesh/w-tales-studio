import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { bookings, crews, shoots, shootsAssignments } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { ShootSchema } from "@/app/(dashboard)/shoots/_components/shoot-form-schema";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
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
		const { id } = await params;
		const shootId = Number.parseInt(id, 10);

		const shoot = await db.query.shoots.findFirst({
			where: and(
				eq(shoots.id, shootId),
				eq(shoots.organizationId, userOrganizationId),
			),
			with: {
				booking: true,
				shootsAssignments: {
					columns: {
						id: true,
						crewId: true,
						isLead: true,
						assignedAt: true,
					},
					with: {
						crew: {
							columns: {
								id: true,
								name: true,
								role: true,
								specialization: true,
								status: true,
							},
							with: {
								member: {
									with: {
										user: {
											columns: {
												name: true,
												email: true,
												image: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		if (!shoot) {
			return NextResponse.json({ message: "Shoot not found" }, { status: 404 });
		}

		// Transform the data to match the form schema
		const formattedShoot = {
			id: shoot.id,
			bookingId: shoot.bookingId.toString(),
			title: shoot.title,
			date: shoot.date,
			time: shoot.time,
			location: shoot.location,
			notes: shoot.notes,
			crewMembers: shoot.shootsAssignments.map((assignment) =>
				assignment.crewId.toString(),
			),
			// Include raw data for table display
			booking: shoot.booking,
			shootsAssignments: shoot.shootsAssignments.map((assignment) => ({
				...assignment,
				crew: {
					...assignment.crew,
					name: assignment.crew.member?.user?.name || assignment.crew.name,
				},
			})),
		};

		return NextResponse.json(formattedShoot, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching shoot:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
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

	const { id } = await params;

	const shootId = Number.parseInt(id, 10);

	if (Number.isNaN(shootId)) {
		return NextResponse.json({ message: "Invalid shoot ID" }, { status: 400 });
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
			const existingShoot = await tx.query.shoots.findFirst({
				where: and(
					eq(shoots.id, shootId),
					eq(shoots.organizationId, userOrganizationId),
				),
			});

			if (!existingShoot) {
				return NextResponse.json(
					{ message: "Shoot not found or access denied" },
					{ status: 404 },
				);
			}

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

			const [updatedShoot] = await tx
				.update(shoots)
				.set({
					bookingId: Number.parseInt(validatedData.bookingId),
					title: validatedData.title ?? existingShoot.title,
					date: validatedData.date ?? existingShoot.date,
					time: validatedData.time ?? existingShoot.time,
					location: validatedData.location ?? existingShoot.location,
					notes: validatedData.notes ?? existingShoot.notes,
					updatedAt: new Date(),
				})
				.where(eq(shoots.id, shootId))
				.returning();

			const existingAssignments = await tx
				.select({ crewId: shootsAssignments.crewId })
				.from(shootsAssignments)
				.where(
					and(
						eq(shootsAssignments.shootId, shootId),
						eq(shootsAssignments.organizationId, userOrganizationId),
					),
				);

			const existingCrewIds = new Set(existingAssignments.map((a) => a.crewId));
			const newCrewIds = new Set(crewAssignments.map((a) => a.crewId));

			if (existingCrewIds.size > 0) {
				// Delete assignments that are no longer needed
				const crewIdsToDelete = [...existingCrewIds].filter(
					(id) => !newCrewIds.has(id),
				);
				if (crewIdsToDelete.length > 0) {
					await tx
						.delete(shootsAssignments)
						.where(
							and(
								eq(shootsAssignments.shootId, shootId),
								inArray(shootsAssignments.crewId, crewIdsToDelete),
								eq(shootsAssignments.organizationId, userOrganizationId),
							),
						);
				}
			}

			// Add new assignments
			const crewIdsToAdd = [...newCrewIds].filter(
				(id) => !existingCrewIds.has(id),
			);
			if (crewIdsToAdd.length > 0) {
				const assignmentValues = crewIdsToAdd.map((crewId) => ({
					shootId: shootId,
					crewId: crewId,
					organizationId: userOrganizationId,
					isLead: false, // Can make this configurable if needed
					assignedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				await tx.insert(shootsAssignments).values(assignmentValues).returning({
					id: shootsAssignments.id,
					crewId: shootsAssignments.crewId,
				});
			}

			const [updatedBooking] = await tx
				.update(bookings)
				.set({ updatedAt: new Date() })
				.where(eq(bookings.id, updatedShoot.bookingId))
				.returning();

			return [updatedShoot, updatedBooking];
		});

		if (!Array.isArray(result)) {
			throw new Error("Expected array result from transaction");
		}

		const [updatedShoot, updatedBooking] = result;

		return NextResponse.json(
			{
				data: { shootId: updatedShoot.id, bookingId: updatedBooking.id },
				message: "Shoot updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating shoot:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
