import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Tasks from "./tasks";
import { fetchTasks } from "@/hooks/use-tasks";

export default async function TaskPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Tasks />
    </HydrationBoundary>
  );
}
