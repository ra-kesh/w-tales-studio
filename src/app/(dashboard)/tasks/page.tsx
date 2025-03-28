import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import Tasks from "./tasks";

export const getTasks = async () => {
	const response = await fetch("/api/tasks", {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch tasks");
	}

	return response.json();
};

export default async function TaskPage() {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["tasks"],
		queryFn: getTasks,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Tasks />
		</HydrationBoundary>
	);
}
