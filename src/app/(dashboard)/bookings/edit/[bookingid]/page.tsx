import React, { Suspense } from "react";
import { EditBookingContent } from "./edit-booking-form";

type Props = {
  params: { bookingId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EditBooking({ params }: Props) {
  const { bookingId } = await params;

  return (
    <div className="flex items-center justify-center p-4 pt-0">
      <Suspense fallback={<div>Loading booking data...</div>}>
        <EditBookingContent bookingId={bookingId} />
      </Suspense>
    </div>
  );
}
