import { getBookingDetail } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { BookingDetails } from "./_components/booking-details";
import { notFound } from "next/navigation";

export default async function BookingDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	const { session } = await getServerSession();

	if (!session?.session.activeOrganizationId) {
		return notFound();
	}

	const booking = await getBookingDetail(
		session.session.activeOrganizationId,
		Number.parseInt(params.id),
	);

	if (!booking) {
		return notFound();
	}

	return <BookingDetails booking={booking} />;
}
