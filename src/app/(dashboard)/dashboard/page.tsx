import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getDashboardData } from "@/lib/db/queries";

import DashboardClient from "./new-dashboard";

export const dynamic = "force-dynamic";

// REMOVED the incorrect type annotation for searchParams
export default async function DashboardPage({
	searchParams,
}: {
	searchParams: { interval?: string; operationsInterval?: string };
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;
	const queryClient = new QueryClient();

	const interval = searchParams.interval || "all";
	const operationsInterval = searchParams.operationsInterval || "7d";

	const filters = {
		interval,
		operationsInterval,
	};

	if (userOrganizationId) {
		const queryKey = ["dashboard", { orgId: userOrganizationId, ...filters }];

		await queryClient.prefetchQuery({
			queryKey,
			queryFn: () =>
				getDashboardData({
					organizationId: userOrganizationId,
					...filters,
				}),
		});
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DashboardClient />
		</HydrationBoundary>
	);
}
