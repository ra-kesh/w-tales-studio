import { useInfiniteQuery } from "@tanstack/react-query";

const fetchSubmissions = async ({
	pageParam = 1,
	queryKey,
}: {
	pageParam?: number;
	queryKey: (
		| string
		| {
				assignmentType: "deliverable" | "task" | "all";
				status: "ready_for_review" | "blocked" | undefined;
				assignedToMe: boolean | undefined;
		  }
	)[];
}) => {
	const [, { assignmentType, status, assignedToMe }] = queryKey as [
		string,
		{
			assignmentType: "deliverable" | "task" | "all";
			status: "ready_for_review" | "blocked" | undefined;
			assignedToMe: boolean | undefined;
		},
	];

	const params = new URLSearchParams({
		page: pageParam.toString(),
		pageSize: "10",
	});

	if (assignmentType && assignmentType !== "all") {
		params.set("assignmentType", assignmentType);
	}
	if (status) {
		params.set("status", status);
	}
	if (assignedToMe) {
		params.set("assignedToMe", "true");
	}

	const res = await fetch(`/api/submissions?${params.toString()}`);
	if (!res.ok) {
		throw new Error("Failed to fetch submissions");
	}
	return res.json();
};

export const useSubmissions = ({
	assignmentType,
	status,
	assignedToMe,
}: {
	assignmentType: "deliverable" | "task";
	status: "ready_for_review" | "blocked";
	assignedToMe: boolean;
}) => {
	return useInfiniteQuery({
		queryKey: ["submissions", { assignmentType, status, assignedToMe }],
		queryFn: fetchSubmissions,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { page, totalPages } = lastPage.pagination;
			return page < totalPages ? page + 1 : undefined;
		},
	});
};
