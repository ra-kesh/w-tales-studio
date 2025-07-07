import { getServerSession } from "@/lib/dal";
import TaskStatusConfigs from "./task-status";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";
import { Protected } from "@/app/restricted-to-roles";

export default async function TaskStatusPage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_status"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_status",
			),
	});

	return (
		<Protected permissions={{ task_status_config: ["read"] }}>
			<div className="space-y-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<TaskStatusConfigs />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
