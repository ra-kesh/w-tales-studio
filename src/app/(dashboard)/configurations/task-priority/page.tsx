import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import { getConfigs } from "@/lib/db/queries";
import TaskPriorityConfigs from "./task-priority";

export default async function TaskPriorityPage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_priority"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_priority",
			),
	});

	return (
		<Protected permissions={{ task_status_config: ["read"] }}>
			<div className="space-y-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<TaskPriorityConfigs />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
