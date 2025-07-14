import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PackageSchema } from "@/app/(dashboard)/configurations/packages/_components/package-form-schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { configurations } from "@/lib/db/schema";
import { generateKey } from "@/lib/utils";
import { checkPackageTypeConflict } from "../route";

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
		body: { permissions: { package_type_config: ["update"] } },
	});
	if (!canUpdate) {
		return NextResponse.json(
			{ message: "You are not authorized to update this package type" },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const packageTypeId = Number.parseInt(id, 10);

	if (isNaN(packageTypeId)) {
		return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
	}

	try {
		const body = await request.json();

		const validation = PackageSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: "Validation error", errors: validation.error.errors },
				{ status: 400 },
			);
		}

		const validatedData = validation.data;
		const key = generateKey(validatedData.value);

		const existingConfig = await db.query.configurations.findFirst({
			where: and(
				eq(configurations.id, packageTypeId),
				eq(configurations.organizationId, userOrganizationId),
				eq(configurations.type, "package_type"),
			),
		});
		if (!existingConfig) {
			return NextResponse.json(
				{ message: "Package type not found" },
				{ status: 404 },
			);
		}

		const conflict = await checkPackageTypeConflict(
			userOrganizationId,
			{ key, value: validatedData.value },
			packageTypeId,
		);
		if (conflict) {
			return NextResponse.json(
				{ message: "A package type with this name already exists." },
				{ status: 409 },
			);
		}

		const [updatedConfig] = await db
			.update(configurations)
			.set({
				key,
				value: validatedData.value,
				metadata: validatedData.metadata,
				updatedAt: new Date(),
			})
			.where(eq(configurations.id, packageTypeId))
			.returning();

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
		body: { permissions: { package_type_config: ["delete"] } },
	});
	if (!canDelete) {
		return NextResponse.json(
			{ message: "You are not authorized to delete this package type" },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const packageTypeId = Number.parseInt(id, 10);

	if (isNaN(packageTypeId)) {
		return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
	}

	try {
		const existingConfig = await db.query.configurations.findFirst({
			where: and(
				eq(configurations.id, packageTypeId),
				eq(configurations.organizationId, userOrganizationId),
				eq(configurations.type, "package_type"),
			),
		});
		if (!existingConfig) {
			return NextResponse.json(
				{ message: "Package type not found" },
				{ status: 404 },
			);
		}

		const [deleted] = await db
			.delete(configurations)
			.where(eq(configurations.id, packageTypeId))
			.returning();

		if (!deleted) {
			return NextResponse.json(
				{ message: "Failed to delete package type" },
				{ status: 500 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting package type:", error);
		return NextResponse.json(
			{
				message: "Internal server error",
				error: "An unexpected error occurred",
			},
			{ status: 500 },
		);
	}
}
