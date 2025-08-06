"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExpenseStats as ExpenseStatsType } from "@/lib/db/queries";
import { ExpensesStats } from "./expense-stats";

interface ExpenseStatsContainerProps {
	initialStats: ExpenseStatsType;
	userOrganizationId: string | null;
}

export function ExpenseStatsContainer({
	initialStats,
	userOrganizationId,
}: ExpenseStatsContainerProps) {
	const { data: stats } = useQuery({
		queryKey: ["expenses", "stats", userOrganizationId],
		queryFn: async () => {
			if (!userOrganizationId) return initialStats;

			const response = await fetch(
				`/api/expenses/stats?orgId=${userOrganizationId}`,
			);
			if (!response.ok) throw new Error("Failed to fetch stats");
			return response.json();
		},
		initialData: initialStats,
		staleTime: 30000, // 30 seconds
		enabled: !!userOrganizationId,
	});

	return <ExpensesStats stats={stats} />;
}
