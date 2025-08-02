import { useInfiniteQuery } from "@tanstack/react-query";

const fetchAllShootAssignments = async ({ pageParam = 1 }) => {
	const res = await fetch(
		`/api/me/assignments/shoots?page=${pageParam}&pageSize=20`,
	);
	if (!res.ok) throw new Error("Failed to fetch shoots");
	return res.json();
};

export const useAllShootAssignments = () => {
	return useInfiniteQuery({
		queryKey: ["allShootAssignments"],
		queryFn: fetchAllShootAssignments,
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
