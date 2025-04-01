import { Deliverables } from "./deliverables";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

import { getDeliverables } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

export default async function DeliverablesPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["deliverables"],
		queryFn: () =>
			getDeliverables(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Deliverables</h2>
					<p className="text-muted-foreground">
						Manage your project deliverables and track their status
					</p>
				</div>
			</div>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Deliverables />
			</HydrationBoundary>
		</div>
	);
}
