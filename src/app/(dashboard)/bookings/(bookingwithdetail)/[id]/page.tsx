import { getBookingDetail } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { BookingDetails } from "./_components/booking-details";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default async function BookingDetailsPage({
	params,
}: {
	params: { id: string };
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
