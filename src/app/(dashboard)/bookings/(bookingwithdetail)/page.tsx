import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import Bookings from "./bookings";
import { getBookings } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { Suspense } from "react";

export default async function BookingPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list"],
		queryFn: () => getBookings(session?.session.activeOrganizationId as string),
	});
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Bookings />
			</HydrationBoundary>
		</Suspense>
	);
}
