import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { Protected } from "@/app/restricted-to-roles";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs } from "@/components/ui/tabs";
import { getServerSession } from "@/lib/dal";
import {
	getPaymentsStats,
	type PaymentsStats as StatsType,
} from "@/lib/db/queries";
import { PaymentStatsContainer } from "./_component/payment-stats-container";
import { PaymentTabs } from "./_component/payments-tab";

export default async function PaymentsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient();

	let initialStats: StatsType;
	if (userOrganizationId) {
		initialStats = await getPaymentsStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["payments", "stats", userOrganizationId],
			queryFn: () => getPaymentsStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialStats = {
			totalReceived: 0,
			totalScheduled: 0,
			receivedCount: 0,
			scheduledCount: 0,
		};
	}

	return (
		<Protected permissions={{ payment: ["list"] }}>
			<div>
				<PaymentStatsContainer
					initialStats={initialStats}
					userOrganizationId={userOrganizationId}
				/>
				<div className="mx-auto flex flex-col px-4 sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
					<Tabs>
						<PaymentTabs />
						<Suspense
							fallback={
								<div className="mt-4">
									<DataTableSkeleton columnCount={5} />
								</div>
							}
						>
							<HydrationBoundary state={dehydrate(queryClient)}>
								{children}
							</HydrationBoundary>
						</Suspense>
					</Tabs>
				</div>
			</div>
		</Protected>
	);
}
