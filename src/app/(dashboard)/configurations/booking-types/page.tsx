import { getServerSession } from "@/lib/dal";
import BookingTypesConfigs from "./booking-types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";

export default async function BookingTypesPage() {
  const { session } = await getServerSession();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["configurations", "booking_type"],
    queryFn: () =>
      getConfigs(
        session?.session.activeOrganizationId as string,
        "booking_type"
      ),
  });

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BookingTypesConfigs />
      </HydrationBoundary>
    </div>
  );
}
