import { getBookingDetail } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import NotFound from "@/app/not-found";
import BookingListWithDetail from "./_components/booking-list-with-detail";
import { Suspense, unstable_ViewTransition as ViewTransition } from "react";

export default async function BookingDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	const { session } = await getServerSession();

	if (!session?.session.activeOrganizationId) {
		return NotFound();
	}

	const { id } = await params;

	const booking = await getBookingDetail(
		session.session.activeOrganizationId,
		Number.parseInt(id),
	);

	if (!booking) {
		return NotFound();
	}

	return (
		<ViewTransition name="experimental-label">
			<BookingListWithDetail booking={booking} />
		</ViewTransition>
	);
}
