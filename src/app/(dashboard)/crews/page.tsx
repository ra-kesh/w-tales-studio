import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { getServerSession } from "@/lib/dal";
import { getCrews } from "@/lib/db/queries";
import { Crews } from "./crews";

export default async function CrewsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["crews"],
		queryFn: () => getCrews(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="h-full flex-1 flex flex-col p-6">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Crews />
			</HydrationBoundary>
		</div>
	);
}
