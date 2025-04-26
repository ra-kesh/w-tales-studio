import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { bookings, shoots } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
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
			},
		});

		if (!shoot) {
			return NextResponse.json({ message: "Shoot not found" }, { status: 404 });
		}

		return NextResponse.json(shoot, { status: 200 });
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

	const body = await request.json();

	const validatedData = ShootSchema.parse({ ...body, id: shootId });

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

			const [updatedShoot] = await tx
				.update(shoots)
				.set({
					bookingId:
						Number.parseInt(validatedData.bookingId) ?? existingShoot.bookingId,
					title: validatedData.title ?? existingShoot.title,
					date: validatedData.date ?? existingShoot.date,
					time: validatedData.time ?? existingShoot.time,
					location: validatedData.location ?? existingShoot.location,
					notes: validatedData.notes ?? existingShoot.notes,
					updatedAt: new Date(),
				})
				.where(eq(shoots.id, shootId))
				.returning();

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
