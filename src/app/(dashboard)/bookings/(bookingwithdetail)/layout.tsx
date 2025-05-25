import { getServerSession } from "@/lib/dal";
import { BookingStats } from "./_components/booking-stats";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getBookings, getBookingsStats, getConfigs } from "@/lib/db/queries";
import { Suspense } from "react";

const BookingLayout = async ({ children }: { children: React.ReactNode }) => {
  const { session } = await getServerSession();
  const userOrganizationId = session?.session.activeOrganizationId as string;

  const queryClient = new QueryClient();

  const bookingsStats = await getBookingsStats(userOrganizationId);

  await queryClient.prefetchQuery({
    queryKey: ["bookings", "list"],
    queryFn: () => getBookings(userOrganizationId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["configurations", "package_type"],
    queryFn: () => getConfigs(userOrganizationId, "package_type"),
  });

  return (
    <div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex relative">
      <Suspense fallback={<div>Loading...</div>}>
        <BookingStats initialStats={bookingsStats} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <div>{children}</div>
        </HydrationBoundary>
      </Suspense>
    </div>
  );
};

export default BookingLayout;
