import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { PackageSchema } from "@/app/(dashboard)/configurations/packages/_components/package-form-schema";
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

	try {
		const result = await db.transaction(async (tx) => {
			const existingConfig = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "package_type"),
					eq(configurations.key, key),
				),
			});

			if (existingConfig) {
				throw new Error("Package type already exists");
			}

			const existingValue = await tx.query.configurations.findFirst({
				where: and(
					eq(configurations.organizationId, userOrganizationId),
					eq(configurations.type, "package_type"),
					eq(configurations.value, validatedData.value),
				),
			});

			if (existingValue) {
				throw new Error("Package type already exists");
			}

			const [newConfig] = await tx
				.insert(configurations)
				.values({
					organizationId: userOrganizationId,
					type: "package_type",
					key: key,
					value: validatedData.value,
					metadata: validatedData.metadata,
					isSystem: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning({ id: configurations.id });

			return newConfig;
		});

		return NextResponse.json(
			{
				data: { packageTypeId: result.id },
				message: "Package type created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating package type:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
