import { Clients } from "./clients";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchClients } from "@/hooks/use-clients";

export default async function ClientsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Clients />
    </HydrationBoundary>
  );
}
