// lib/hooks/use-all-task-assignments.ts

import { useInfiniteQuery } from "@tanstack/react-query";

const fetchAllTaskAssignments = async ({ pageParam = 1 }) => {
	const res = await fetch(
		`/api/me/assignments/tasks?page=${pageParam}&pageSize=20`,
	);
	if (!res.ok) throw new Error("Failed to fetch tasks");
	return res.json();
};

export const useAllTaskAssignments = () => {
	return useInfiniteQuery({
		queryKey: ["allTaskAssignments"],
		queryFn: fetchAllTaskAssignments,
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalFetched = allPages.length * 20;
			if (totalFetched < lastPage.pagination.total) {
				return allPages.length + 1;
			}
			return undefined;
		},
	});
};
