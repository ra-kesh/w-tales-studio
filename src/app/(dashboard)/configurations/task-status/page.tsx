import { getServerSession } from "@/lib/dal";
import TaskStatusConfigs from "./task-status";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";

export default async function TaskStatusPage() {
  const { session } = await getServerSession();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["configurations", "task_status"],
    queryFn: () =>
      getConfigs(
        session?.session.activeOrganizationId as string,
        "task_status"
      ),
  });

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskStatusConfigs />
      </HydrationBoundary>
    </div>
  );
}