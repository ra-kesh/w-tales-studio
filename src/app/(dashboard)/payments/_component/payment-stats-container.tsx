"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaymentsStats as PaymentStatsType } from "@/lib/db/queries";
import { PaymentsStats } from "./payment-stats";

interface PaymentStatsContainerProps {
	initialStats: PaymentStatsType;
	userOrganizationId: string | null;
}

export function PaymentStatsContainer({
	initialStats,
	userOrganizationId,
}: PaymentStatsContainerProps) {
	const { data: stats } = useQuery({
		queryKey: ["payments", "stats", userOrganizationId],
		queryFn: async () => {
			if (!userOrganizationId) return initialStats;

			const response = await fetch(
				`/api/payments/stats?orgId=${userOrganizationId}`,
			);
			if (!response.ok) throw new Error("Failed to fetch stats");
			return response.json();
		},
		initialData: initialStats,
		staleTime: 30000, // 30 seconds
		enabled: !!userOrganizationId,
	});

	return <PaymentsStats stats={stats} />;
}
