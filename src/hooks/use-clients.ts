import type { ClientBookingRow } from "@/lib/db/queries";
import type { Client } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

interface Location {
	name: string;
}

interface ClientsResponse {
	data: ClientBookingRow[];
	total: number;
	pageCount: number;
	limit: number;
}

export async function fetchClients(
	searchParams: URLSearchParams,
): Promise<ClientsResponse> {
	const response = await fetch(`/api/clients?${searchParams.toString()}`);
	if (!response.ok) {
		throw new Error("Failed to fetch clients");
	}
	return response.json();
}

export function useClients() {
	const searchParams = useSearchParams();
	return useQuery({
		queryKey: ["clients", searchParams.toString()],
		queryFn: () => fetchClients(searchParams),
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
