import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Shoots } from "./shoots";
import { getShoots } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { Suspense } from "react";

export default async function ShootsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "shoot", "list"],
		queryFn: () => getShoots(session?.session.activeOrganizationId as string),
	});
	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Shoots />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
