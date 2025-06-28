import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { and, eq, not } from "drizzle-orm";
import { generateKey } from "@/lib/utils";
import {
	TaskPriorityFormValues,
} from "@/app/(dashboard)/configurations/_components/task-priority-form-schema";

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

	const taskPriorityId = Number.parseInt(id, 10);
	const body = await request.json();

	const validation = TaskPriorityFormValues.safeParse(body);

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
					eq(configurations.id, taskPriorityId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_priority"),
				),
			});

			if (!existingConfig) {
				throw new Error("Task priority not found or access denied");
			}
			const newKey = validatedData.value
				? generateKey(validatedData.value)
				: existingConfig.key;

			const newValue = validatedData.value ?? existingConfig.value;

			// Check for conflicts with other task priorities (excluding the current one)
			const conflictingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_priority"),
					eq(configurations.key, newKey),
					not(eq(configurations.id, taskPriorityId)),
				),
			});
			if (conflictingConfig) {
				throw new Error("Task priority already exists");
			}

			// Check for duplicate value (excluding the current one)
			const conflictingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_priority"),
					eq(configurations.value, newValue),
					not(eq(configurations.id, taskPriorityId)),
				),
			});

			if (conflictingValue) {
				throw new Error("Task priority already exists");
			}

			// Update the task priority configuration
			const [updatedConfig] = await tx
				.update(configurations)
				.set({
					key: newKey,
					value: newValue,
					updatedAt: new Date(),
				})
				.where(eq(configurations.id, taskPriorityId))
				.returning();

			return updatedConfig;
		});
		return NextResponse.json(
			{
				data: { taskPriorityId: updatedConfig.id },
				message: "Task priority updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating task priority:", error);
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

	const taskPriorityId = Number.parseInt(id, 10);

	try {
		const [deletedConfig] = await db
			.delete(configurations)
			.where(
				and(
					eq(configurations.id, taskPriorityId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_priority"),
				),
			)
			.returning();

		if (!deletedConfig) {
			return NextResponse.json(
				{ message: "Task priority not found or access denied" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ message: "Task priority deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting task priority:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
