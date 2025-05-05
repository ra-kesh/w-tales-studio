"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { sanitizeEmptiness } from "@/lib/utils";
import type { BookingFormValues } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";

export const useBookingMutation = () => {
  const queryClient = useQueryClient();

  async function addBooking(data: BookingFormValues) {
    const response = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(sanitizeEmptiness(data)),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to add booking");
    }

    return responseData;
  }

  const addBookingMutation = useMutation({
    mutationFn: addBooking,
    onMutate: () => {
      const toastId = toast.loading("adding new booking");
      return { toastId };
    },
    onError: (error: unknown, variables, context) => {
      toast.error(`${error}`);

      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onSuccess: (data, variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success("Booking added successfully");
      queryClient.invalidateQueries({
        queryKey: ["bookings", "list"],
      });
    },
  });

  return {
    addBookingMutation,
  };
};

export const useUpdateBookingMutation = (id: string) => {
  const queryClient = useQueryClient();

  async function updateBooking(data: BookingFormValues) {
    const response = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(sanitizeEmptiness(data)),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update booking");
    }

    return response.json();
  }

  return useMutation({
    mutationFn: updateBooking,
    onMutate: () => {
      const toastId = toast.loading("Updating booking");
      return { toastId };
    },
    onError: (error, variables, context) => {
      toast.error(error.message);
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onSuccess: (data, variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }

      queryClient.invalidateQueries({
        queryKey: [
          "bookings",
          "detail",
          {
            bookingId: data.data.bookingId.toString(),
          },
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
      toast.success("Booking updated successfully");
    },
  });
};
