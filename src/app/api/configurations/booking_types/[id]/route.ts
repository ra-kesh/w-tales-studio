import { and, eq, not } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
	type BookingTypeMetadata,
	BookingTypeSchema,
} from "@/app/(dashboard)/configurations/booking-types/_components/booking-type-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { generateKey } from "@/lib/utils";
import { checkBookingTypeConflict } from "../route";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
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

	const canUpdate = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				booking_type_config: ["update"],
			},
		},
	});

	if (!canUpdate) {
		return NextResponse.json(
			{ message: "You are not authorized to update booking type" },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const bookingTypeId = Number.parseInt(id, 10);
	const body = await request.json();

	const validation = BookingTypeSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;
	const { value, metadata } = validatedData;
	const key = generateKey(value);

	try {
		const existingConfig = await db.query.configurations.findFirst({
			where: and(
				eq(configurations.id, bookingTypeId),
				eq(configurations.organizationId, userOrganizationId),
				eq(configurations.type, "booking_type"),
			),
		});

		if (!existingConfig) {
			throw new Error("Booking type not found or access denied");
		}

		const conflict = await checkBookingTypeConflict(
			userOrganizationId,
			{ key, value },
			bookingTypeId,
		);
		if (conflict) {
			return NextResponse.json(
				{ message: "A booking type with this name already exists." },
				{ status: 409 },
			);
		}

		const [updatedConfig] = await db
			.update(configurations)
			.set({ key, value, metadata, updatedAt: new Date() })
			.where(eq(configurations.id, bookingTypeId))
			.returning();

		return NextResponse.json(
			{
				data: { bookingTypeId: updatedConfig.id },
				message: "Booking type updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating booking type:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
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

	const canDelete = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				booking_type_config: ["delete"],
			},
		},
	});

	if (!canDelete) {
		return NextResponse.json(
			{ message: "You are not authorized to delete booking type" },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const bookingTypeId = Number.parseInt(id, 10);

	try {
		const [deletedConfig] = await db
			.delete(configurations)
			.where(
				and(
					eq(configurations.id, bookingTypeId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "booking_type"),
				),
			)
			.returning();

		if (!deletedConfig) {
			return NextResponse.json(
				{ message: "Booking type not found or access denied" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Booking type deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting booking type:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
