import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import Tasks from "./tasks";

import { getServerSession } from "@/lib/dal";
import { getConfigs, getTasks } from "@/lib/db/queries";

export default async function TaskPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["tasks"],
		queryFn: () => getTasks(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_priority"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_priority",
			),
	});
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_status"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_status",
			),
	});

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
				</div>
			</div>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Tasks />
			</HydrationBoundary>
		</div>
	);
}
