"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { sanitizeEmptiness } from "@/lib/utils";
import type { BookingFormValues } from "@/app/(dashboard)/bookings/add/_components/booking-form-schema";

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
				queryKey: ["bookings"],
			});
		},
	});

	return {
		addBookingMutation,
	};
};
