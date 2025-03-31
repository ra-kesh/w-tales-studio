import { Expenses } from "./expenses";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchExpenses } from "@/hooks/use-expenses";

export default async function ExpensesPage() {
  const queryClient = new QueryClient();
  if (process.env.NODE_ENV !== "production") {
    await queryClient.prefetchQuery({
      queryKey: ["expenses"],
      queryFn: fetchExpenses,
    });
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Expenses />
    </HydrationBoundary>
  );
}
