import { and, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CrewSchema } from "@/app/(dashboard)/crews/_components/crew-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { getCrews } from "@/lib/db/queries";
import { crews } from "@/lib/db/schema";

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
		const result = await getCrews(userOrganizationId);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching crews:", error);
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

	const canCreate = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions: {
				crew: ["create"],
			},
		},
	});

	if (!canCreate) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		const body = await request.json();

		const validatedData = CrewSchema.parse(body);

		const { name, email, phoneNumber, equipment, role, specialization } =
			validatedData;

		if (email || phoneNumber) {
			const existingCrew = await db.query.crews.findFirst({
				where: or(
					email ? eq(crews.email, email) : undefined,
					phoneNumber ? eq(crews.phoneNumber, phoneNumber) : undefined,
				),
			});

			if (existingCrew) {
				const message =
					existingCrew.email === email
						? "A crew member with this email already exists."
						: "A crew member with this phone number already exists.";
				return NextResponse.json({ message }, { status: 409 });
			}
		}
		const newCrew = await db
			.insert(crews)
			.values({
				organizationId: userOrganizationId,
				name: name || null,
				email: email || null,
				phoneNumber: phoneNumber || null,
				equipment: equipment || [],
				role: role || "crew",
				specialization: specialization || null,
				status: "available", // Default status
			})
			.returning();

		return NextResponse.json(newCrew[0], { status: 201 });
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			return NextResponse.json({ errors: error.errors }, { status: 400 });
		}
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("Error creating crew:", error);
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: Request) {
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
		const body = await request.json();

		const {
			id,
			memberId,
			name,
			email,
			phoneNumber,
			equipment,
			role,
			specialization,
			status,
		} = body;

		if (!id) {
			return NextResponse.json(
				{ message: "Crew ID is required" },
				{ status: 400 },
			);
		}

		// Check if crew exists and belongs to the organization
		const existingCrew = await db.query.crews.findFirst({
			where: (crews, { eq, and }) =>
				and(eq(crews.id, id), eq(crews.organizationId, userOrganizationId)),
		});

		if (!existingCrew) {
			return NextResponse.json({ message: "Crew not found" }, { status: 404 });
		}

		// If memberId is being updated, verify the new member exists and belongs to the organization
		if (memberId && memberId !== existingCrew.memberId) {
			const memberExists = await db.query.members.findFirst({
				where: (members, { eq, and }) =>
					and(
						eq(members.id, memberId),
						eq(members.organizationId, userOrganizationId),
					),
			});

			if (!memberExists) {
				return NextResponse.json(
					{ message: "Invalid member ID" },
					{ status: 400 },
				);
			}
		}

		// Ensure at least name or memberId is present
		if (!memberId && !name && !existingCrew.name && !existingCrew.memberId) {
			return NextResponse.json(
				{ message: "Either name or memberId must be provided" },
				{ status: 400 },
			);
		}

		const updatedCrew = await db
			.update(crews)
			.set({
				memberId: memberId ?? existingCrew.memberId,
				name: name ?? existingCrew.name,
				email: email ?? existingCrew.email,
				phoneNumber: phoneNumber ?? existingCrew.phoneNumber,
				equipment: equipment ?? existingCrew.equipment,
				role: role ?? existingCrew.role,
				specialization: specialization ?? existingCrew.specialization,
				status: status ?? existingCrew.status,
				updatedAt: new Date(),
			})
			.where(
				and(eq(crews.id, id), eq(crews.organizationId, userOrganizationId)),
			)
			.returning();

		if (!updatedCrew.length) {
			return NextResponse.json(
				{ message: "Failed to update crew" },
				{ status: 500 },
			);
		}

		return NextResponse.json(updatedCrew[0], { status: 200 });
	} catch (error: unknown) {
		console.error("Error updating crew:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
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
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ message: "Crew ID is required" },
				{ status: 400 },
			);
		}

		// Check if crew exists and belongs to the organization
		const existingCrew = await db.query.crews.findFirst({
			where: (crews, { eq, and }) =>
				and(
					eq(crews.id, Number.parseInt(id, 10)),
					eq(crews.organizationId, userOrganizationId),
				),
		});

		if (!existingCrew) {
			return NextResponse.json({ message: "Crew not found" }, { status: 404 });
		}

		// Delete the crew member
		const deletedCrew = await db
			.delete(crews)
			.where(
				and(
					eq(crews.id, Number.parseInt(id, 10)),
					eq(crews.organizationId, userOrganizationId),
				),
			)
			.returning();

		if (!deletedCrew.length) {
			return NextResponse.json(
				{ message: "Failed to delete crew" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ message: "Crew deleted successfully" },
			{ status: 200 },
		);
	} catch (error: unknown) {
		console.error("Error deleting crew:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
