import { getServerSession } from "@/lib/dal";
import { BookingStats } from "./_components/booking-stats";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import {
	getBookings,
	getBookingsStats,
	getConfigs,
	type BookingStats as BookingStatsType,
} from "@/lib/db/queries"; // Import BookingStatsType
import { Suspense } from "react";

const BookingLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient();

	let bookingsStats: BookingStatsType;

	if (userOrganizationId) {
		bookingsStats = await getBookingsStats(userOrganizationId);
	} else {
		bookingsStats = {
			totalBookings: 0,
			activeBookings: 0,
			totalExpenses: 0,
			totalRevenue: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	if (userOrganizationId) {
		await queryClient.prefetchQuery({
			queryKey: ["bookings", "list"],
			queryFn: () => getBookings(userOrganizationId),
		});

		await queryClient.prefetchQuery({
			queryKey: ["configurations", "package_type"],
			queryFn: () => getConfigs(userOrganizationId, "package_type"),
		});
	}

	return (
		<div className="hidden h-full flex-1 flex-col space-y-4 p-6 md:flex relative">
			<Suspense fallback={<div>Loading...</div>}>
				<BookingStats stats={bookingsStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div>{children}</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default BookingLayout;
