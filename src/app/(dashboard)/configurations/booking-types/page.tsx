import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import { getConfigs } from "@/lib/db/queries";
import BookingTypesConfigs from "./booking-types";

export default async function BookingTypesPage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "booking_type"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"booking_type",
			),
	});

	return (
		<Protected permissions={{ booking_type_config: ["read"] }}>
			<div className="space-y-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<BookingTypesConfigs />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
