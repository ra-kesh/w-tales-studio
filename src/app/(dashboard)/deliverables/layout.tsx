import { getServerSession } from "@/lib/dal";
import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import {
	getMinimalBookings,
	getDeliverables,
	type DeliverableStats as DeliverableStatsType,
	getDeliverablesStats,
	getConfigs,
} from "@/lib/db/queries";
import { Suspense } from "react";
import { DeliverableStats } from "./_components/deliverable-stats";

const DeliverableLayout = async ({
	children,
}: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	let deliverableStats: DeliverableStatsType;

	if (userOrganizationId) {
		deliverableStats = await getDeliverablesStats(userOrganizationId);
	} else {
		deliverableStats = {
			totalDeliverables: 0,
			activeDeliverables: 0,
			pendingDeliverables: 0,
			overdueDeliverables: 0,
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
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "deliverable", "list"],
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
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<DeliverableStats stats={deliverableStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default DeliverableLayout;
