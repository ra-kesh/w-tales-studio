import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { fetchPaymentSchedules } from "@/hooks/use-payments";
import { getServerSession } from "@/lib/dal";
import { getMinimalBookings } from "@/lib/db/queries";
import { ScheduledPaymentsClientPage } from "./scheduled-payments-cleint";

export default async function ReceivedPaymentsPage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["payment-schedules", "list", ""],
			queryFn: () => fetchPaymentSchedules(new URLSearchParams()),
		}),
		queryClient.prefetchQuery({
			queryKey: ["bookings", "list", "minimal"],
			queryFn: () =>
				getMinimalBookings(session?.session.activeOrganizationId as string),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ScheduledPaymentsClientPage />
		</HydrationBoundary>
	);
}
