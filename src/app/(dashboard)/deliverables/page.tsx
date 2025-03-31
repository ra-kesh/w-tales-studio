import { Deliverables } from "./deliverables";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { fetchDeliverables } from "@/hooks/use-deliverables";

export default async function DeliverablesPage() {
	const queryClient = new QueryClient();
	// await queryClient.prefetchQuery({
	// 	queryKey: ["deliverables"],
	// 	queryFn: fetchDeliverables,
	// });
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Deliverables />
		</HydrationBoundary>
	);
}
