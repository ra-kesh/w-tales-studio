import { TaskStatusSchema } from "@/app/(dashboard)/configurations/_components/task-status-form-schema";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { generateKey } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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

	const body = await request.json();

	const validation = TaskStatusSchema.safeParse(body);

	if (!validation.success) {
		return NextResponse.json(
			{ message: "Validation error", errors: validation.error.errors },
			{ status: 400 },
		);
	}

	const validatedData = validation.data;

	const key = generateKey(validatedData.value);

	try {
		const result = await db.transaction(async (tx) => {
			const existingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
					eq(configurations.key, key),
				),
			});

			if (existingConfig) {
				throw new Error("Task status already exists");
			}

			const existingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "task_status"),
					eq(configurations.value, validatedData.value),
				),
			});

			if (existingValue) {
				throw new Error("Task status already exists");
			}

			const [newConfig] = await tx
				.insert(configurations)
				.values({
					organizationId: userOrganizationId,
					type: "task_status",
					key: key,
					value: validatedData.value,
					isSystem: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: configurations.id });

			return newConfig;
		});

		return NextResponse.json(
			{
				data: { taskStatusId: result.id },
				message: "Task status created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating task status:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
