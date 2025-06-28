import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { and, eq, not } from "drizzle-orm";
import { generateKey } from "@/lib/utils";
import {
	TaskStatusFormValues,
} from "@/app/(dashboard)/configurations/_components/task-status-form-schema";

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

	const taskStatusId = Number.parseInt(id, 10);
	const body = await request.json();

	const validation = TaskStatusFormValues.safeParse(body);

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
					eq(configurations.id, taskStatusId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
				),
			});

			if (!existingConfig) {
				throw new Error("Task status not found or access denied");
			}
			const newKey = validatedData.value
				? generateKey(validatedData.value)
				: existingConfig.key;

			const newValue = validatedData.value ?? existingConfig.value;

			// Check for conflicts with other task statuses (excluding the current one)
			const conflictingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
					eq(configurations.key, newKey),
					not(eq(configurations.id, taskStatusId)),
				),
			});
			if (conflictingConfig) {
				throw new Error("Task status already exists");
			}

			// Check for duplicate value (excluding the current one)
			const conflictingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
					eq(configurations.value, newValue),
					not(eq(configurations.id, taskStatusId)),
				),
			});

			if (conflictingValue) {
				throw new Error("Task status already exists");
			}

			// Update the task status configuration
			const [updatedConfig] = await tx
				.update(configurations)
				.set({
					key: newKey,
					value: newValue,
					updatedAt: new Date(),
				})
				.where(eq(configurations.id, taskStatusId))
				.returning();

			return updatedConfig;
		});
		return NextResponse.json(
			{
				data: { taskStatusId: updatedConfig.id },
				message: "Task status updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating task status:", error);
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

	const taskStatusId = Number.parseInt(id, 10);

	try {
		const [deletedConfig] = await db
			.delete(configurations)
			.where(
				and(
					eq(configurations.id, taskStatusId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
				),
			)
			.returning();

		if (!deletedConfig) {
			return NextResponse.json(
				{ message: "Task status not found or access denied" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Task status deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting task status:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
