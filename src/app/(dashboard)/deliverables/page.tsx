import { Deliverables } from "./deliverables";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

import { getDeliverables } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { Suspense } from "react";

export default async function DeliverablesPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["deliverables"],
		queryFn: () =>
			getDeliverables(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="h-full flex-1 flex flex-col p-6">
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Deliverables />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
