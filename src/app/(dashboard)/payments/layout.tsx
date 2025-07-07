import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { Protected } from "@/app/restricted-to-roles";
import {
	fetchPaymentSchedules,
	fetchReceivedPayments,
} from "@/hooks/use-payments";
import { getServerSession } from "@/lib/dal";
import {
	getPaymentsStats,
	type PaymentsStats as StatsType,
} from "@/lib/db/queries";
import { PaymentsStats } from "./_component/payment-stats";

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

	const queryClient = new QueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["received-payments", "list", ""],
			queryFn: () => fetchReceivedPayments(new URLSearchParams()),
		}),
		queryClient.prefetchQuery({
			queryKey: ["payment-schedules", "list", ""],
			queryFn: () => fetchPaymentSchedules(new URLSearchParams()),
		}),
	]);

	return (
		<Protected permissions={{ payment: ["read"] }}>
			<div>
				<PaymentsStats stats={stats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="mx-auto flex flex-col px-4 sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
