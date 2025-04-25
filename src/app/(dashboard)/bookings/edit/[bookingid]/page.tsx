"use client";

import React, { Suspense, use } from "react";
import { useUpdateBookingMutation } from "@/hooks/use-booking-mutation";
import BookingForm from "../../_components/booking-form/booking-from";
import { defaultBooking } from "../../_components/booking-form/booking-form-schema";
import { useBookingFormData } from "@/hooks/use-bookings";

type Params = Promise<{ bookingId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const EditBooking = (props: { params: Params; searchParams: SearchParams }) => {
  const params = use(props.params);
  const bookingId = params.bookingId;

  const { data: booking, isLoading, error } = useBookingFormData(bookingId);

  const updateBookingMutation = useUpdateBookingMutation(bookingId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading booking: {error.message}</div>;
  }

  return (
    <div className="flex items-center justify-center p-4 pt-0">
      <Suspense>
        <BookingForm
          defaultValues={booking ?? defaultBooking}
          onSubmit={updateBookingMutation.mutate}
          mode="edit"
          isPending={updateBookingMutation.isPending}
        />
      </Suspense>
    </div>
  );
};

export default EditBooking;
