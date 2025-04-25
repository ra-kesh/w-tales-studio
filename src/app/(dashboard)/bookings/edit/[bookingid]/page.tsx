import React, { Suspense } from "react";
import { EditBookingContent } from "./edit-booking-form";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getBookingDetail } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

type Props = {
  params: { bookingId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditBooking({ params }: Props) {
  const { bookingId } = await params;

  const { session } = await getServerSession();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () =>
      getBookingDetail(
        session?.session.activeOrganizationId as string,
        Number.parseInt(bookingId)
      ),
  });

  return (
    <div className="flex items-center justify-center p-4 pt-0">
      <Suspense fallback={<div>Loading booking data...</div>}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EditBookingContent bookingId={bookingId} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
