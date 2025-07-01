import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { ShootsResponse } from "@/types/shoots";

export async function fetchShoots(
	searchParams: URLSearchParams,
): Promise<ShootsResponse> {
	const response = await fetch(`/api/shoots?${searchParams.toString()}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch shoots");
	}

	return response.json();
}

export function useShoots() {
	const searchParams = useSearchParams();
	return useQuery({
		queryKey: ["bookings", "shoot", "list", searchParams.toString()],
		queryFn: () => fetchShoots(searchParams),
	});
}

export function useShootDetail(shootId: string) {
	return useQuery({
		queryKey: ["bookings", "shoot", "detail", { shootId }],
		queryFn: async () => {
			const response = await fetch(`/api/shoots/${shootId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch shoot details");
			}
			return response.json();
		},
		enabled: !!shootId,
	});
}
