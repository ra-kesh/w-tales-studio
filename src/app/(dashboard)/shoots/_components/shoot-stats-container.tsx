"use client";

import { useQuery } from "@tanstack/react-query";
import type { ShootStats as ShootStatsType } from "@/lib/db/queries";
import { ShootsStats } from "./shoot-stats";

interface ShootStatsContainerProps {
	initialStats: ShootStatsType;
	userOrganizationId: string | null;
}

export function ShootStatsContainer({
	initialStats,
	userOrganizationId,
}: ShootStatsContainerProps) {
	const { data: stats } = useQuery({
		queryKey: ["shoots", "stats", userOrganizationId],
		queryFn: async () => {
			if (!userOrganizationId) return initialStats;

			const response = await fetch(
				`/api/shoots/stats?orgId=${userOrganizationId}`,
			);
			if (!response.ok) throw new Error("Failed to fetch stats");
			return response.json();
		},
		initialData: initialStats,
		staleTime: 30000, // 30 seconds
		enabled: !!userOrganizationId,
	});

	return <ShootsStats stats={stats} />;
}
