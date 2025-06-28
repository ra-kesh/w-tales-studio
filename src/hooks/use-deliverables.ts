import { useQuery } from "@tanstack/react-query";
import type { DeliverablesResponse } from "@/types/deliverables";
import { useSearchParams } from "next/navigation";

export async function fetchDeliverables(
	searchParams: URLSearchParams,
): Promise<DeliverablesResponse> {
	const response = await fetch(`/api/deliverables?${searchParams.toString()}`, {
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
	const searchParams = useSearchParams();

	return useQuery({
		queryKey: ["bookings", "deliverable", "list", searchParams.toString()],
		queryFn: () => fetchDeliverables(searchParams),
		// placeholderData: { data: [], total: 0 },
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
