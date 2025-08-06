'use client';

import { useQuery } from '@tanstack/react-query';
import type { TaskStats as TaskStatsType } from '@/lib/db/queries';
import { TasksStats } from './task-stats';

interface TaskStatsContainerProps {
  initialStats: TaskStatsType;
  userOrganizationId: string | null;
}

export function TaskStatsContainer({
  initialStats,
  userOrganizationId,
}: TaskStatsContainerProps) {
  const { data: stats } = useQuery({
    queryKey: ['tasks', 'stats', userOrganizationId],
    queryFn: async () => {
      if (!userOrganizationId) return initialStats;

      const response = await fetch(
        `/api/tasks/stats?orgId=${userOrganizationId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    initialData: initialStats,
    staleTime: 30000, // 30 seconds
    enabled: !!userOrganizationId,
  });

  return <TasksStats stats={stats} />;
}
