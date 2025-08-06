import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	type BookingStats as BookingStatsType,
	getBookings,
	getBookingsStats,
	getConfigs,
} from "@/lib/db/queries";
import { BookingStatsContainer } from "../_components/booking-stats-container";
import { BookingStats } from "./_components/booking-stats";

const BookingLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient();

	let initialBookingsStats: BookingStatsType;

	if (userOrganizationId) {
		initialBookingsStats = await getBookingsStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["bookings", "stats", userOrganizationId],
			queryFn: () => getBookingsStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialBookingsStats = {
			totalBookings: 0,
			activeBookings: 0,
			newBookings: 0,
			overdueBookings: 0,
		};
	}

	if (userOrganizationId) {
		await queryClient.prefetchQuery({
			queryKey: ["bookings", "list", ""],
			queryFn: () => getBookings(userOrganizationId),
		});

		await queryClient.prefetchQuery({
			queryKey: ["configurations", "package_type"],
			queryFn: () => getConfigs(userOrganizationId, "package_type"),
		});
	}

	return (
		<Protected permissions={{ booking: ["read"] }}>
			<div>
				<BookingStatsContainer
					initialStats={initialBookingsStats}
					userOrganizationId={userOrganizationId}
				/>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default BookingLayout;
