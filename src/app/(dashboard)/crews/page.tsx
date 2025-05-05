import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Crews } from "./crews";
import { getServerSession } from "@/lib/dal";
import { Suspense } from "react";

import { getCrews } from "@/lib/db/queries";

export default async function CrewsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["crews"],
		queryFn: () => getCrews(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Crews</h2>
				</div>
			</div>
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Crews />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
