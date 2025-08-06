'use client';

import { useQuery } from '@tanstack/react-query';
import type { DeliverableStats as DeliverableStatsType } from '@/lib/db/queries';
import { DeliverableStats } from './deliverable-stats';

interface DeliverableStatsContainerProps {
  initialStats: DeliverableStatsType;
  userOrganizationId: string | null;
}

export function DeliverableStatsContainer({
  initialStats,
  userOrganizationId,
}: DeliverableStatsContainerProps) {
  const { data: stats } = useQuery({
    queryKey: ['deliverables', 'stats', userOrganizationId],
    queryFn: async () => {
      if (!userOrganizationId) return initialStats;

      const response = await fetch(
        `/api/deliverables/stats?orgId=${userOrganizationId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    initialData: initialStats,
    staleTime: 30000, // 30 seconds
    enabled: !!userOrganizationId,
  });

  return <DeliverableStats stats={stats} />;
}
