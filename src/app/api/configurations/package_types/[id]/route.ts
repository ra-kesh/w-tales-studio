import { and, eq, not } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
	type PackageMetadata,
	PackageSchema,
} from "@/app/(dashboard)/configurations/packages/_components/package-form-schema";
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
				throw new Error("Package type not found or access denied");
			}
			const newKey = validatedData.value
				? generateKey(validatedData.value)
				: existingConfig.key;

			const newValue = validatedData.value ?? existingConfig.value;

			const existingMetadata =
				(existingConfig.metadata as PackageMetadata | null) || {
					defaultCost: 0,
					defaultDeliverables: [],
				};

			const newMetadata: PackageMetadata = {
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
				throw new Error("Package type already exists");
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
				throw new Error("Package type  already exists");
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
