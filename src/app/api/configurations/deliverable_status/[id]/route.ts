import { and, eq, not } from "drizzle-orm";
import { NextResponse } from "next/server";
import { DeliverableStatusSchema } from "@/app/(dashboard)/configurations/_components/deliverable-status-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { generateKey } from "@/lib/utils";

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

	const deliverableStatusId = Number.parseInt(id, 10);
	const body = await request.json();
	const validation = DeliverableStatusSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	try {
		const updatedConfig = await db.transaction(async (tx) => {
			const existingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.id, deliverableStatusId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "deliverable_status"),
				),
			});

			if (!existingConfig) {
				throw new Error("Deliverable status not found or access denied");
			}

			if (existingConfig.isSystem) {
				throw new Error("Cannot update a system deliverable status");
			}

			const newKey = validatedData.value
				? generateKey(validatedData.value)
				: existingConfig.key;

			const newValue = validatedData.value ?? existingConfig.value;

			// Check for conflicts with other deliverable statuses (excluding the current one)
			const conflictingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "deliverable_status"),
					eq(configurations.key, newKey),
					not(eq(configurations.id, deliverableStatusId)),
				),
			});
			if (conflictingConfig) {
				throw new Error("Deliverable status already exists");
			}

			// Check for duplicate value (excluding the current one)
			const conflictingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "deliverable_status"),
					eq(configurations.value, newValue),
					not(eq(configurations.id, deliverableStatusId)),
				),
			});

			if (conflictingValue) {
				throw new Error("Deliverable status already exists");
			}

			// Update the deliverable status configuration
			const [updatedConfig] = await tx
				.update(configurations)
				.set({
					key: newKey,
					value: newValue,
					updatedAt: new Date(),
				})
				.where(eq(configurations.id, deliverableStatusId))
				.returning();

			return updatedConfig;
		});
		return NextResponse.json(
			{
				data: { deliverableStatusId: updatedConfig.id },
				message: "Deliverable status updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating deliverable status:", error);
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

	const deliverableStatusId = Number.parseInt(id, 10);

	const existing = await db.query.configurations.findFirst({
		where: and(
			eq(configurations.id, deliverableStatusId),
			eq(configurations.organizationId, userOrganizationId),
			eq(configurations.type, "deliverable_status"),
		),
	});
	if (!existing) {
		return NextResponse.json(
			{ message: "Deliverable status not found" },
			{ status: 404 },
		);
	}
	if (existing.isSystem) {
		return NextResponse.json(
			{ message: "Cannot delete a system deliverable status" },
			{ status: 403 },
		);
	}

	try {
		const [deletedConfig] = await db
			.delete(configurations)
			.where(
				and(
					eq(configurations.id, deliverableStatusId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "deliverable_status"),
				),
			)
			.returning();

		if (!deletedConfig) {
			return NextResponse.json(
				{ message: "Deliverable status not found or access denied" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Deliverable status deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting deliverable status:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
