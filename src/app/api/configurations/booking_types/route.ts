import { and, eq, not, or } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BookingTypeSchema } from "@/app/(dashboard)/configurations/booking-types/_components/booking-type-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { generateKey } from "@/lib/utils";

export async function POST(request: Request) {
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

	const canCreate = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				booking_type_config: ["create"],
			},
		},
	});

	if (!canCreate) {
		return NextResponse.json(
			{ message: "You are not authorized to add new booking type" },
			{ status: 403 },
		);
	}

	const body = await request.json();

	const validation = BookingTypeSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	try {
		const { value, metadata } = validatedData;
		const key = generateKey(validatedData.value);

		const conflict = await checkBookingTypeConflict(userOrganizationId, {
			key,
			value,
		});
		if (conflict) {
			return NextResponse.json(
				{ message: "A booking type with this name already exists." },
				{ status: 409 },
			);
		}

		const [newConfig] = await db
			.insert(configurations)
			.values({
				organizationId: userOrganizationId,
				type: "booking_type",
				key: key,
				value: value,
				metadata: metadata,
				isSystem: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning({ id: configurations.id });

		return NextResponse.json(
			{
				data: { bookingTypeId: newConfig.id },
				message: "Booking type created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating booking type:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function checkBookingTypeConflict(
	orgId: string,
	data: { key: string; value: string },
	excludeId?: number,
) {
	const conditions = [
		eq(configurations.organizationId, orgId),
		eq(configurations.type, "booking_type"),
		or(eq(configurations.key, data.key), eq(configurations.value, data.value)),
	];

	if (excludeId) {
		conditions.push(not(eq(configurations.id, excludeId)));
	}

	return db.query.configurations.findFirst({ where: and(...conditions) });
}
