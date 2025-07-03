import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getDashboardData } from "@/lib/db/queries";

import DashboardClient from "./dashboardclient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ interval?: string; operationsInterval?: string }>;
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;
	const queryClient = new QueryClient();

	const { interval, operationsInterval } = await searchParams;

	const safeInterval = interval ?? "all";
	const safeOperationsInterval = operationsInterval ?? "7d";

	const filters = {
		interval: safeInterval,
		operationsInterval: safeOperationsInterval,
	};

	if (userOrganizationId) {
		const queryKey = ["dashboard", { orgId: userOrganizationId, ...filters }];

		await queryClient.prefetchQuery({
			queryKey,
			queryFn: () =>
				getDashboardData({
					organizationId: userOrganizationId,
					interval: filters.interval,
					operationsInterval: filters.operationsInterval,
				}),
		});
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DashboardClient />
		</HydrationBoundary>
	);
}
