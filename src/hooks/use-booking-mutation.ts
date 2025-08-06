"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BookingEditFormValues } from "@/app/(dashboard)/bookings/_components/booking-form/booking-edit-form-schema";
import type { BookingFormValues } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { sanitizeEmptiness } from "@/lib/utils";

export const useBookingMutation = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

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

			queryClient.invalidateQueries({
				queryKey: ["onboarding"],
			});

			// Enhanced toast with action button
			toast.success("Booking added successfully", {
				description: `${variables.bookingName} has been added to your bookings.`,
				action: {
					label: "View Booking",
					onClick: () => router.push(`/bookings/${data.data.bookingId}`),
				},
				duration: 5000, // Show for 5 seconds to give user time to click
			});

			queryClient.invalidateQueries({
				queryKey: ["bookings", "list"],
			});
		},
	});

	return {
		addBookingMutation,
	};
};

export function useUpdateBookingMutation() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async (variables: {
			id: string;
			data: BookingEditFormValues;
		}) => {
			const { id, data } = variables;

			const response = await fetch(`/api/bookings/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update booking.");
			}
			return response.json();
		},
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

			toast.success("Booking updated successfully", {
				description: `${variables.data.bookingName} has been updated.`,
				action: {
					label: "View Details",
					onClick: () => router.push(`/bookings/${data.data.bookingId}`),
				},
				duration: 5000,
			});

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
			queryClient.invalidateQueries({ queryKey: ["bookings", "stats"] });
		},
	});
}
