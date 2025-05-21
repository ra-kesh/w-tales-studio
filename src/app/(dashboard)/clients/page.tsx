import { Clients } from "./clients";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getClients } from "@/lib/db/queries";
import { Suspense } from "react";

export default async function ClientsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => getClients(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Clients />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
