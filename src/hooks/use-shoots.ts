import { useQuery } from "@tanstack/react-query";
import type { Shoot } from "@/lib/db/schema";

interface ShootsResponse {
	data: Shoot[];
	total: number;
}

export async function fetchShoots(): Promise<ShootsResponse> {
	const response = await fetch("/api/shoots", {
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
	return useQuery({
		queryKey: ["shoots"],
		queryFn: fetchShoots,
		placeholderData: { data: [], total: 0 },
	});
}

export function useShootDetail(shootId: string) {
	return useQuery({
		queryKey: ["shoot", { shootId }],
		queryFn: async () => {
			const response = await fetch(`/api/shoots/${shootId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch shoot details");
			}
			const data = await response.json();

			// Transform the API response to match the form schema
			return {
				...data,
				bookingId: data.bookingId.toString(),
				crewMembers:
					data.shootsAssignments?.map((assignment: { crewId: number }) =>
						assignment.crewId.toString(),
					) || [],
			};
		},
		enabled: !!shootId,
	});
}
