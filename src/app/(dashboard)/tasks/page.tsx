import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import Tasks from "./tasks";
import { fetchTasks } from "@/hooks/use-tasks";
import { fetchConfigs } from "@/hooks/use-task-configs";

export default async function TaskPage() {
	const queryClient = new QueryClient();
	if (process.env.NODE_ENV !== "production") {
		await queryClient.prefetchQuery({
			queryKey: ["tasks"],
			queryFn: fetchTasks,
		});

		await queryClient.prefetchQuery({
			queryKey: ["configurations", "task_priority"],
			queryFn: () => fetchConfigs("task_priority"),
		});

		await queryClient.prefetchQuery({
			queryKey: ["configurations", "task_status"],
			queryFn: () => fetchConfigs("task_status"),
		});
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Tasks />
		</HydrationBoundary>
	);
}
