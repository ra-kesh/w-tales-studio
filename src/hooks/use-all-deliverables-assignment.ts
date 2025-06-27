
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchAllDeliverableAssignments = async ({ pageParam = 1 }) => {
	const res = await fetch(
		`/api/me/assignments/deliverables?page=${pageParam}&pageSize=20`,
	);
	if (!res.ok) throw new Error("Failed to fetch deliverables");
	return res.json();
};

export const useAllDeliverableAssignments = () => {
	return useInfiniteQuery({
		queryKey: ["allDeliverableAssignments"],
		queryFn: fetchAllDeliverableAssignments,
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
