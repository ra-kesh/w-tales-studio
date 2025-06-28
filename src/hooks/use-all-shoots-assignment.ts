// lib/hooks/use-all-shoot-assignments.ts

import { useInfiniteQuery } from "@tanstack/react-query";

// This function fetches a single page
const fetchAllShootAssignments = async ({ pageParam = 1 }) => {
	const res = await fetch(
		`/api/me/assignments/shoots?page=${pageParam}&pageSize=20`,
	);
	if (!res.ok) throw new Error("Failed to fetch shoots");
	return res.json();
};

// A hook for infinite scrolling/pagination
export const useAllShootAssignments = () => {
	return useInfiniteQuery({
		queryKey: ["allShootAssignments"],
		queryFn: fetchAllShootAssignments,
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalFetched = allPages.length * 20; // Assuming pageSize is 20
			if (totalFetched < lastPage.pagination.total) {
				return allPages.length + 1;
			}
			return undefined;
		},
	});
};
