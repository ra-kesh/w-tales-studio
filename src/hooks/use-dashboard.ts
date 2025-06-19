"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/auth-client";
import type { Deliverable, Shoot, Task } from "@/lib/db/schema";

// MODIFIED: Simplified filters interface
export interface DashboardFilters {
	interval: string;
	operationsInterval: string;
}

// MODIFIED: Updated data shape to match the new API response
export interface DashboardData {
	kpis: {
		projectedRevenue: string;
		collectedCash: string;
		totalExpenses: string;
		overdueInvoicesValue: string;
	};
	bookingAnalytics: {
		summary: {
			totalBookings: number;
			activeBookings: number;
			newBookings: number;
		};
		// CHANGED: Replaced bookingTypeDistribution with recentNewBookings
		recentNewBookings: {
			id: number;
			name: string;
			clientName: string | null;
			packageType: string;
			createdAt: string;
		}[];
		packageTypeDistribution: any[];
		bookingsOverTime: any[];
	};
	expenseAnalytics: {
		category: string;
		total: number;
	}[];
	actionItems: {
		overdueTasks: any[];
		overdueDeliverables: any[];
		unstaffedShoots: any[];
	};
	operations: {
		upcomingShoots: {
			list: Shoot[];
			total: number;
		};
		upcomingTasks: {
			list: Task[];
			total: number;
		};
		upcomingDeliverables: {
			list: Deliverable[];
			total: number;
		};
	};
}

/**
 * The function that fetches data from our API endpoint on the client.
 */
async function fetchDashboardData(
	filters: DashboardFilters,
): Promise<DashboardData> {
	const params = new URLSearchParams({
		interval: filters.interval,
		operationsInterval: filters.operationsInterval,
	});

	const response = await fetch(`/api/dashboard?${params.toString()}`);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch dashboard data");
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
		// MODIFIED: The query key now uses the single interval
		queryKey: ["dashboard", { orgId: activeOrganizationId, ...filters }],
		queryFn: () => fetchDashboardData(filters),
		enabled: !!activeOrganizationId,
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
