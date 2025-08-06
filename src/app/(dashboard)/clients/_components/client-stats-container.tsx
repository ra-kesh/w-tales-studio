"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClientStats as ClientStatsType } from "@/lib/db/queries";
import { ClientsStats } from "./client-stats";

interface ClientStatsContainerProps {
	initialStats: ClientStatsType;
	userOrganizationId: string | null;
}

export function ClientStatsContainer({
	initialStats,
	userOrganizationId,
}: ClientStatsContainerProps) {
	const { data: stats } = useQuery({
		queryKey: ["clients", "stats", userOrganizationId],
		queryFn: async () => {
			if (!userOrganizationId) return initialStats;

			const response = await fetch(
				`/api/clients/stats?orgId=${userOrganizationId}`,
			);
			if (!response.ok) throw new Error("Failed to fetch stats");
			return response.json();
		},
		initialData: initialStats,
		staleTime: 30000, // 30 seconds
		enabled: !!userOrganizationId,
	});

	return <ClientsStats stats={stats} />;
}
