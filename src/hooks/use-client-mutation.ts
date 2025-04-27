import { useMutation } from "@tanstack/react-query";
import type { Client } from "@/lib/db/schema";

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
	return useMutation({
		mutationFn: updateClient,
	});
}
