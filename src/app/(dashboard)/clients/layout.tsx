import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	type ClientStats as ClientStatsType,
	getClientStats,
	getClients,
	getMinimalBookings,
} from "@/lib/db/queries";
import { ClientStatsContainer } from "./_components/client-stats-container";

const ClientLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	let initialClientStats: ClientStatsType;

	if (userOrganizationId) {
		initialClientStats = await getClientStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["clients", "stats", userOrganizationId],
			queryFn: () => getClientStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialClientStats = {
			totalClients: 0,
			newClients: 0,
			activeClients: 0,
			clientsWithOverdueDeliverables: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	await queryClient.prefetchQuery({
		queryKey: ["clients", ""],
		queryFn: () => getClients(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<Protected permissions={{ client: ["read"] }}>
			<div>
				<ClientStatsContainer
					initialStats={initialClientStats}
					userOrganizationId={userOrganizationId}
				/>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default ClientLayout;
