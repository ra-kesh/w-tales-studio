import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/lib/db/schema";
import { toast } from "sonner";

interface UpdateClientVariables {
	data: Partial<Client>;
	clientId: string;
}

async function updateClient({ data, clientId }: UpdateClientVariables) {
	const response = await fetch(`/api/clients/${clientId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Failed to update client");
	}

	return response.json();
}

export function useUpdateClientMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateClient,
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.invalidateQueries({
				queryKey: ["client", { id: data.clientId.toString() }],
			});
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			toast.success("Client updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update client");
		},
	});
}
