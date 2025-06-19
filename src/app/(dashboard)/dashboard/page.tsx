import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getDashboardData } from "@/lib/db/queries";
// Assuming Example is your new client component from the previous step
import Example from "./dashboard";
import DashboardClient from "./new-dashboard";

export const dynamic = "force-dynamic";

// REMOVED the incorrect type annotation for searchParams
export default async function DashboardPage({
	searchParams,
}: {
	searchParams: { interval?: string };
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;
	const queryClient = new QueryClient();

	if (userOrganizationId) {
		const queryKey = ["dashboard", { orgId: userOrganizationId }];

		await queryClient.prefetchQuery({
			queryKey,
			queryFn: () =>
				getDashboardData({
					organizationId: userOrganizationId,
					interval: "all",
				}),
		});
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{/* Your client component that uses the prefetched data */}
			{/* <Example /> */}
			<DashboardClient />
		</HydrationBoundary>
	);
}
