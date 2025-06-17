// lib/hooks/use-dashboard.ts (New File)
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/auth-client"; // Your session hook

// Define the shape of the filters for type safety
export interface DashboardFilters {
	financialsInterval: string;
	bookingsInterval: string;
	operationsInterval: string;
}

// Define the expected shape of the API response
// (You can generate these types from your schema or define them manually)
export interface DashboardData {
	kpis: {
		projectedRevenue: string;
		collectedCash: string;
		totalExpenses: string;
	};
	bookingAnalytics: {
		summary: {
			totalBookings: number;
			activeBookings: number;
			cancellationRate: number;
		};
		bookingTypeDistribution: any[];
		packageTypeDistribution: any[];
		bookingsOverTime: any[];
	};
	actionItems: {
		overdueTasks: any[];
		overdueDeliverables: any[];
		unstaffedShoots: any[];
	};
	operations: {
		upcomingShoots: any[];
		upcomingTasks: any[];
		upcomingDeliverables: any[];
	};
}

/**
 * The function that fetches data from our API endpoint on the client.
 */
async function fetchDashboardData(
	filters: DashboardFilters,
): Promise<DashboardData> {
	const params = new URLSearchParams({
		financialsInterval: filters.financialsInterval,
		bookingsInterval: filters.bookingsInterval,
		operationsInterval: filters.operationsInterval,
	});

	const response = await fetch(`/api/dashboard?${params.toString()}`);

	if (!response.ok) {
		throw new Error("Failed to fetch dashboard data");
	}

	return response.json();
}

/**
 * Custom hook to fetch and manage the main studio dashboard data.
 * @param filters - The current state of the dashboard filters.
 */
export function useDashboardData(filters: DashboardFilters) {
	const { data: session } = useSession();
	const activeOrganizationId = session?.session.activeOrganizationId;

	return useQuery<DashboardData, Error>({
		// The query key uniquely identifies this data based on the filters.
		// When filters change, the key changes, and the data is refetched.
		queryKey: ["dashboard", { orgId: activeOrganizationId, ...filters }],

		// The function that will be called to fetch the data.
		queryFn: () => fetchDashboardData(filters),

		// Only run this query if there is an active organization.
		enabled: !!activeOrganizationId,

		// For a better UX, keep showing the old data while new data is being fetched.
		placeholderData: (previousData) => previousData,

		// Consider data fresh for 5 minutes to avoid excessive refetching.
		staleTime: 1000 * 60 * 5,
	});
}
