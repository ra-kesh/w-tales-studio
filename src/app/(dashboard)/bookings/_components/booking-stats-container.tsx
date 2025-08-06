"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { BookingStats as BookingStatsType } from "@/lib/db/queries";
import { BookingStats } from "../(bookingwithdetail)/_components/booking-stats";

interface BookingStatsContainerProps {
	initialStats: BookingStatsType;
	userOrganizationId: string | null;
}

export function BookingStatsContainer({
	initialStats,
	userOrganizationId,
}: BookingStatsContainerProps) {
	const { data: stats } = useQuery({
		queryKey: ["bookings", "stats", userOrganizationId],
		queryFn: async () => {
			if (!userOrganizationId) return initialStats;

			const response = await fetch(
				`/api/bookings/stats?orgId=${userOrganizationId}`,
			);
			if (!response.ok) throw new Error("Failed to fetch stats");
			return response.json();
		},
		initialData: initialStats,
		staleTime: 30000, // 30 seconds
		enabled: !!userOrganizationId,
	});

	return <BookingStats stats={stats} />;
}
