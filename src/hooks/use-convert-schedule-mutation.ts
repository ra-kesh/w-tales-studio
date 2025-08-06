import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function convertSchedule({ id, data }: { id: number; data: any }) {
	const response = await fetch(`/api/payment-schedules/${id}/convert`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to convert payment schedule");
	}

	return response.json();
}

export function useConvertScheduleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: convertSchedule,
		onSuccess: () => {
			toast.success("Payment schedule converted successfully");
			queryClient.invalidateQueries({ queryKey: ["payments", "stats"] });

			queryClient.invalidateQueries({
				queryKey: ["payment-schedules", "list", ""],
			});
			queryClient.invalidateQueries({
				queryKey: ["received-payments", "list", ""],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
