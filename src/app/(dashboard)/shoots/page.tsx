import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Shoots } from "./shoots";
import { getShoots } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

export default async function ShootsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["shoots"],
		queryFn: () => getShoots(session?.session.activeOrganizationId as string),
	});
	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Shoots</h2>
				</div>
			</div>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Shoots />
			</HydrationBoundary>
		</div>
	);
}
