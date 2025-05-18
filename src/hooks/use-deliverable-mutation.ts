import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeliverableFormValues } from "@/app/(dashboard)/deliverables/deliverable-form-schema";
import { toast } from "sonner";

export function useCreateDeliverableMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DeliverableFormValues) => {
			const response = await fetch("/api/deliverables", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create deliverable");
			}

			return response.json();
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({
				queryKey: ["bookings", "deliverable", "list"],
			});

			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"deliverable",
					"detail",
					{
						deliverableId: data.deliverableId.toString(),
					},
				],
			});

			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});

			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			toast.success("Deliverable created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create deliverable");
		},
	});
}

export function useUpdateDeliverableMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			deliverableId,
		}: {
			data: DeliverableFormValues;
			deliverableId: string;
		}) => {
			const response = await fetch(`/api/deliverables/${deliverableId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update deliverable");
			}

			return response.json();
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({
				queryKey: ["bookings", "deliverable", "list"],
			});
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"deliverable",
					"detail",
					{
						deliverableId: data.deliverableId.toString(),
					},
				],
			});

			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			toast.success("Deliverable updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update deliverable");
		},
	});
}
