import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReceivedPaymentFormValues } from "@/app/(dashboard)/payments/_component/received-payment-form-schema";
import type { ScheduledPaymentFormValues } from "@/app/(dashboard)/payments/_component/scheduled-payment-form-schema";

export function useCreateReceivedPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ReceivedPaymentFormValues) => {
			const response = await fetch("/api/received-payments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to add received payment.");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["received-payments"] });
			toast.success("Payment added successfully!");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// --- UPDATE Mutation ---
// The mutation function will expect the payment ID along with the form values.
export function useUpdateReceivedPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			receivedPaymentId,
		}: {
			data: ReceivedPaymentFormValues;
			receivedPaymentId: string;
		}) => {
			const response = await fetch(
				`/api/received-payments/${receivedPaymentId}`,
				{
					method: "PUT", // Assuming you'll use PATCH for updates
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update payment.");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["received-payments"] });
			toast.success("Payment updated successfully!");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// --- DELETE Mutation ---
// The mutation function will expect just the ID of the payment to delete.
export function useDeleteReceivedPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/received-payments?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete payment.");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["received-payments"] });
			toast.success("Payment deleted successfully!");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
export function useCreateScheduledPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ScheduledPaymentFormValues) => {
			const response = await fetch("/api/payments/scheduled", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create scheduled payment");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments", "scheduled"] });
			toast.success("Scheduled payment created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create scheduled payment");
		},
	});
}

export function useUpdateScheduledPaymentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			scheduledPaymentId,
		}: {
			data: ScheduledPaymentFormValues;
			scheduledPaymentId: string;
		}) => {
			const response = await fetch(
				`/api/payments/scheduled/${scheduledPaymentId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update scheduled payment");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments", "scheduled"] });
			toast.success("Scheduled payment updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update scheduled payment");
		},
	});
}
