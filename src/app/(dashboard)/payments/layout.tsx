import { Suspense } from "react";
import { Protected } from "@/app/restricted-to-roles";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Tabs } from "@/components/ui/tabs";
import { getServerSession } from "@/lib/dal";
import {
	getPaymentsStats,
	type PaymentsStats as StatsType,
} from "@/lib/db/queries";
import { PaymentsStats } from "./_component/payment-stats";
import { PaymentTabs } from "./_component/payments-tab";

export default async function PaymentsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId;

	let stats: StatsType;
	if (userOrganizationId) {
		stats = await getPaymentsStats(userOrganizationId);
	} else {
		stats = {
			totalReceived: "0",
			totalScheduled: "0",
			receivedCount: 0,
			scheduledCount: 0,
		};
	}

	return (
		<Protected permissions={{ payment: ["list"] }}>
			<div>
				<PaymentsStats stats={stats} />
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
							{children}
						</Suspense>
					</Tabs>
				</div>
			</div>
		</Protected>
	);
}
