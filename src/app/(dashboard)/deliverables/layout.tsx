import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	type DeliverableStats as DeliverableStatsType,
	getConfigs,
	getDeliverables,
	getDeliverablesStats,
	getMinimalBookings,
} from "@/lib/db/queries";
import { DeliverableStatsContainer } from "./_components/deliverable-stats-container";

const DeliverableLayout = async ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	let initialDeliverableStats: DeliverableStatsType;

	if (userOrganizationId) {
		initialDeliverableStats = await getDeliverablesStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["deliverables", "stats", userOrganizationId],
			queryFn: () => getDeliverablesStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialDeliverableStats = {
			totalDeliverables: 0,
			activeDeliverables: 0,
			pendingDeliverables: 0,
			overdueDeliverables: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "deliverable", "list", ""],
		queryFn: () =>
			getDeliverables(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["configurations", "deliverable_status"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"deliverable_status",
			),
	});

	return (
		<Protected permissions={{ deliverable: ["read"] }}>
			<div>
				<DeliverableStatsContainer
					initialStats={initialDeliverableStats}
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

export default DeliverableLayout;
