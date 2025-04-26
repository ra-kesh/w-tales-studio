"use client";

import { useUpdateBookingMutation } from "@/hooks/use-booking-mutation";
import BookingForm from "../../_components/booking-form/booking-from";
import { useBookingFormData } from "@/hooks/use-bookings";
import { defaultBooking } from "../../_components/booking-form/booking-form-schema";

export function EditBookingContent({ bookingId }: { bookingId: string }) {
  const { data: booking, isLoading, error } = useBookingFormData(bookingId);

  const updateBookingMutation = useUpdateBookingMutation(bookingId);

  if (isLoading) {
    return <div>Loading booking details...</div>;
  }

  if (error) {
    return <div>Error loading booking: {error.message}</div>;
  }

  return (
    <BookingForm
      defaultValues={booking ?? defaultBooking}
      onSubmit={updateBookingMutation.mutate}
      mode="edit"
      isPending={updateBookingMutation.isPending}
    />
  );
}
