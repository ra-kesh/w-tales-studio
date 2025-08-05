import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";
import { getBookingDetail } from "@/lib/db/queries";
import { BookingDetails } from "./_components/booking-details";

export default async function BookingDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	const { id } = await params;

	await queryClient.prefetchQuery({
		queryKey: [
			"bookings",
			"detail",
			{
				bookingId: id,
			},
		],
		queryFn: () =>
			getBookingDetail(
				session?.session.activeOrganizationId as string,
				Number.parseInt(id),
			),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BookingDetails id={id} />
		</HydrationBoundary>
	);
}
