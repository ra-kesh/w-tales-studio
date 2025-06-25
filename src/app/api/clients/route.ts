import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import {
	type AllowedClientSortFields,
	type ClientFilters,
	type ClientSortOption,
	getClients,
} from "@/lib/db/queries";

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
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

		// 1. Parse Sort Parameter
		const sortParam = searchParams.get("sort");
		let sortOptions: ClientSortOption[] | undefined = undefined;
		if (sortParam) {
			try {
				const parsedSort = JSON.parse(sortParam);
				const allowedFields: AllowedClientSortFields[] = [
					"name",
					"bookingName",
					"packageCost",
					"status",
					"bookingCreatedAt",
				];
				sortOptions = parsedSort.filter((option: ClientSortOption) =>
					allowedFields.includes(option.id),
				);
			} catch (e) {
				console.error("Failed to parse sort parameter:", e);
			}
		}

		// 2. Construct Filters Object from URL Search Params
		const filters: ClientFilters = {
			name: searchParams.get("name") || undefined,
			bookingId: searchParams.get("bookingId") || undefined,
			packageType: searchParams.get("packageType") || undefined,
		};

		// 3. Call the updated getClients function with all parameters
		const result = await getClients(
			userOrganizationId,
			page,
			limit,
			sortOptions,
			filters,
		);

		return NextResponse.json(result, { status: 200 });
	} catch (error: unknown) {
		console.error("Error fetching clients:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ message: "Internal server error", error: errorMessage },
			{ status: 500 },
		);
	}
}
