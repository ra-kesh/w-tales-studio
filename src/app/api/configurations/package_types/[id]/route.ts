import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { and, eq, not } from "drizzle-orm";

import { auth } from "@/lib/auth"; // Adjust path
import { headers } from "next/headers";
import { generateKey } from "@/lib/utils"; // Adjust path
import { PackageSchema } from "@/app/(dashboard)/configurations/_components/package-form-schema";

export async function PATCH(
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
		const configId = Number.parseInt(id, 10);
		const body = await request.json();

		const existingConfig = await db.query.configurations.findFirst({
			where: eq(configurations.id, configId),
		});

		if (!existingConfig) {
			return NextResponse.json(
				{ message: "Configuration not found" },
				{ status: 404 },
			);
		}

		const [updatedConfig] = await db
			.update(configurations)
			.set({
				key:
					body.key ||
					body.value?.toLowerCase().replace(/\s+/g, "_") ||
					existingConfig.key,
				value: body.value || existingConfig.value,
				metadata: body.metadata || existingConfig.metadata,
				updatedAt: new Date(),
			})
			.where(eq(configurations.id, configId))
			.returning();

		return NextResponse.json(updatedConfig);
	} catch (error) {
		console.error("Error updating configuration:", error);
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

	const packageTypeId = Number.parseInt(id, 10);
	const body = await request.json();

	const validation = PackageSchema.safeParse(body);

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
					eq(configurations.id, packageTypeId),
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "package_type"),
				),
			});

			if (!existingConfig) {
				return NextResponse.json(
					{ message: "Package type not found or access denied" },
					{ status: 404 },
				);
			}

			const newKey = validatedData.value
				? generateKey(validatedData.value)
				: existingConfig.key;

			const newValue = validatedData.value ?? existingConfig.value;

			// Merge existing metadata with updated metadata
			const existingMetadata = existingConfig.metadata || {};

			const newMetadata = {
				defaultCost:
					validatedData.metadata?.defaultCost ?? existingMetadata.defaultCost,
				defaultDeliverables:
					validatedData.metadata?.defaultDeliverables ??
					existingMetadata.defaultDeliverables,
			};

			// Check for conflicts with other package types (excluding the current one)
			const conflictingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "package_type"),
					eq(configurations.key, newKey),
					not(eq(configurations.id, packageTypeId)),
				),
			});

			if (conflictingConfig) {
				return NextResponse.json(
					{ message: "Package type  already exists" },
					{ status: 409 },
				);
			}

			// Check for duplicate value (excluding the current one)
			const conflictingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "package_type"),
					eq(configurations.value, newValue),
					not(eq(configurations.id, packageTypeId)),
				),
			});

			if (conflictingValue) {
				return NextResponse.json(
					{ message: "Package type already exists" },
					{ status: 409 },
				);
			}

			// Update the package type configuration
			const [updatedConfig] = await tx
				.update(configurations)
				.set({
					key: newKey,
					value: newValue,
					metadata: newMetadata,
					updatedAt: new Date(),
				})
				.where(eq(configurations.id, packageTypeId))
				.returning();

			return updatedConfig;
		});

		return NextResponse.json(
			{
				data: { packageTypeId: updatedConfig.id },
				message: "Package type updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating package type:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
