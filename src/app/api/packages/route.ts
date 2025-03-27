import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { packageConfigs } from "@/lib/db/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
// Adjust the path to your schema

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	// Optional: Role-based access control (e.g., only admins can access)
	// Uncomment this if you want to restrict access to specific roles
	/*
    if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }
    */

	try {
		// Query the package_configs table to fetch all package configurations
		const packages = await db
			.select({
				packageType: packageConfigs.packageType,
				defaultCost: packageConfigs.defaultCost,
				defaultDeliverables: packageConfigs.defaultDeliverables,
			})
			.from(packageConfigs);

		// Return the package configurations as JSON
		return NextResponse.json({ packages }, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching package configurations:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
