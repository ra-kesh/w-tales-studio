// app/(dashboard)/dashboard/page.tsx (Corrected)

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getDashboardData } from "@/lib/db/queries";
import StudioDashboardClient from "./studio-dashbord-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;
	const queryClient = new QueryClient();

	// This logic is now safe because the page is explicitly dynamic.
	const financialsInterval =
		(searchParams.financialsInterval as string) || "all";
	const bookingsInterval = (searchParams.bookingsInterval as string) || "all";
	const operationsInterval =
		(searchParams.operationsInterval as string) || "30d";

	const filters = {
		financialsInterval,
		bookingsInterval,
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
			<StudioDashboardClient />
		</HydrationBoundary>
	);
}
