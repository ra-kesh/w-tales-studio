import { useQuery } from "@tanstack/react-query";
import { deliverables, type Deliverable } from "@/lib/db/schema";

interface DeliverablesResponse {
	data: Deliverable[];
	total: number;
}

export async function fetchDeliverables(): Promise<DeliverablesResponse> {
	const response = await fetch("/api/deliverables", {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("Failed to fetch deliverables");
	}
	return response.json();
}

export function useDeliverables() {
	return useQuery({
		queryKey: ["bookings", "deliverable", "list"],
		queryFn: fetchDeliverables,
		placeholderData: { data: [], total: 0 },
	});
}

async function fetchDeliverable(id: string) {
	const response = await fetch(`/api/deliverables/${id}`);
	if (!response.ok) {
		throw new Error("Failed to fetch deliverable");
	}
	return response.json();
}

export function useDeliverable(id: string | null) {
	return useQuery({
		queryKey: [
			"bookings",
			"deliverable",
			"detail",
			{
				deliverableId: id,
			},
		],
		queryFn: () => fetchDeliverable(id as string),
		enabled: Boolean(id),
	});
}
