import React, { Suspense } from "react";
import { EditBookingContent } from "./edit-booking-form";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getBookingDetail, getCrews } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditBooking({ params }: Props) {
  const { id } = await params;

  const { session } = await getServerSession();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["booking-detail", id],
    queryFn: () =>
      getBookingDetail(
        session?.session.activeOrganizationId as string,
        Number.parseInt(id)
      ),
  });

  await queryClient.prefetchQuery({
    queryKey: ["crews"],
    queryFn: () => getCrews(session?.session.activeOrganizationId as string),
  });

  return (
    <div className="flex items-center justify-center p-4 pt-0">
      <Suspense fallback={<div>Loading booking data...</div>}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EditBookingContent bookingId={id} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
