import { getServerSession } from "@/lib/dal";
import { BookingStats } from "./_components/booking-stats";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getBookings } from "@/lib/db/queries";
import { Suspense } from "react";

const BookingLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list"],
		queryFn: () => getBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex">
			{/* <BookingStats stats={stats} /> */}
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div>{children}</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default BookingLayout;
