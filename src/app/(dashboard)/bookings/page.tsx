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
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex ">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
				</div>
			</div>
			<Suspense>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Bookings />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
