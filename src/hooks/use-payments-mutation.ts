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
			const response = await fetch("/api/payment-schedules", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to schedule payment.");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
			toast.success("Payment scheduled successfully!");
		},
		onError: (error: Error) => toast.error(error.message),
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
				`/api/payment-schedules/${scheduledPaymentId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				},
			);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update payment.");
			}
			return response.json();
		},
		onSuccess: (updatedData) => {
			toast.success("Scheduled payment updated!");
			queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
			queryClient.invalidateQueries({
				queryKey: ["scheduled-payment", updatedData.id],
			});
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
