import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";

const ReviewLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();
	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient();

	// let bookingsStats: BookingStatsType;

	// if (userOrganizationId) {
	//     bookingsStats = await getBookingsStats(userOrganizationId);
	// } else {
	//     bookingsStats = {
	//         totalBookings: 0,
	//         activeBookings: 0,
	//         newBookings: 0,
	//         overdueBookings: 0,
	//     };

	//     console.warn(
	//         "User organization ID not found during booking layout prerender. Using default stats.",
	//     );
	// }

	// if (userOrganizationId) {
	//     await queryClient.prefetchQuery({
	//         queryKey: ["bookings", "list", ""],
	//         queryFn: () => getBookings(userOrganizationId),
	//     });

	//     await queryClient.prefetchQuery({
	//         queryKey: ["configurations", "package_type"],
	//         queryFn: () => getConfigs(userOrganizationId, "package_type"),
	//     });
	// }

	return (
		<Protected permissions={{ booking: ["read"] }}>
			<div>
				{/* <BookingStats stats={bookingsStats} /> */}
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default ReviewLayout;
