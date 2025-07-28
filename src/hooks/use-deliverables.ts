import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { MinimalDeliverablesResponse } from "@/lib/db/queries";
import type { DeliverablesResponse } from "@/types/deliverables";

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

// async function fetchMinimalDeliverables(
// 	bookingId: string,
// ): Promise<DeliverablesResponse> {
// 	const response = await fetch(
// 		`/api/deliverables/minimal?bookingId=${bookingId}`,
// 	);
// 	if (!response.ok) {
// 		throw new Error("Failed to fetch minimal deliverables");
// 	}
// 	return response.json();
// }

async function fetchMinimalDeliverables(
	bookingId?: string | null,
): Promise<MinimalDeliverablesResponse> {
	const url = new URL("/api/deliverables/minimal", window.location.origin);

	if (bookingId) {
		url.searchParams.append("bookingId", bookingId);
	}

	const response = await fetch(url.toString());

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.message || "Failed to fetch minimal deliverables",
		);
	}
	return response.json();
}

// export function useMinimalDeliverables(bookingId: string | null) {
// 	return useQuery({
// 		queryKey: [
// 			"bookings",
// 			"deliverable",
// 			"minimal",
// 			{
// 				bookingId,
// 			},
// 		],
// 		queryFn: () => fetchMinimalDeliverables(bookingId as string),
// 		enabled: Boolean(bookingId),
// 	});
// }

export function useMinimalDeliverables(bookingId?: string | null) {
	return useQuery({
		queryKey: [
			"bookings",
			"deliverables",
			"minimal",
			bookingId ? { bookingId } : { scope: "all" },
		],
		queryFn: () => fetchMinimalDeliverables(bookingId),
	});
}
