import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { fetchBookings } from "@/hooks/use-bookings";
import Bookings from "./bookings";

export default async function BookingPage() {
	const queryClient = new QueryClient();
	if (process.env.NODE_ENV !== "production") {
		await queryClient.prefetchQuery({
			queryKey: ["bookings"],
			queryFn: fetchBookings,
		});
	}
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Bookings />
		</HydrationBoundary>
	);
}
