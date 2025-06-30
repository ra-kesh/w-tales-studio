import { getServerSession } from "@/lib/dal";
import TaskPriorityConfigs from "./task-priority";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";

export default async function TaskPriorityPage() {
  const { session } = await getServerSession();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["configurations", "task_priority"],
    queryFn: () =>
      getConfigs(
        session?.session.activeOrganizationId as string,
        "task_priority"
      ),
  });

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskPriorityConfigs />
      </HydrationBoundary>
    </div>
  );
}