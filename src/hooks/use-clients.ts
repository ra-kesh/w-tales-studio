import type { Client } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

interface Location {
	name: string;
}

interface ClientsResponse {
	data: Client[];
	total: number;
	page: number;
	limit: number;
}

export async function fetchClients(): Promise<ClientsResponse> {
	const response = await fetch("/api/clients");
	if (!response.ok) {
		throw new Error("Failed to fetch clients");
	}
	return response.json();
}

export function useClients() {
	return useQuery({
		queryKey: ["clients"],
		queryFn: fetchClients,
	});
}

async function fetchClientDetail(id: string) {
	const response = await fetch(`/api/clients/${id}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch client details: ${response.statusText}`);
	}
	return response.json();
}

export function useClientDetail(id: string | undefined) {
	return useQuery({
		queryKey: ["client", { id }],
		queryFn: () => fetchClientDetail(id as string),
		enabled: Boolean(id),
	});
}
