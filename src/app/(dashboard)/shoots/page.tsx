import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Shoots } from "./shoots";
import { fetchShoots } from "@/hooks/use-shoots";

export default async function ShootsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["shoots"],
    queryFn: fetchShoots,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Shoots />
    </HydrationBoundary>
  );
}
