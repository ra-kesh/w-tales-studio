import { getServerSession } from "@/lib/dal";
import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import {
	getMinimalBookings,
	type ClientStats as ClientStatsType,
	getClientStats,
	getClients,
} from "@/lib/db/queries";
import { Suspense } from "react";
import { ClientsStats } from "./_components/client-stats";

const ClientLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	let clientStats: ClientStatsType;

	if (userOrganizationId) {
		clientStats = await getClientStats(userOrganizationId);
	} else {
		clientStats = {
			totalClients: 0,
			newClients: 0,
			activeClients: 0, // have at least one non-completed booking
			clientsWithOverdueDeliverables: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	await queryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => getClients(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<ClientsStats stats={clientStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default ClientLayout;
