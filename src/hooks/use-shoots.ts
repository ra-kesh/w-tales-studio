import { useQuery } from "@tanstack/react-query";
import type { Shoot } from "@/lib/db/schema";

type ShootAssignment = {
	crew: {
		name: string | null;
		role: string | null;
		member?: {
			user?: {
				name: string | null;
			};
		};
	};
	isLead?: boolean;
};

interface ShootsResponse {
	data: (Shoot & {
		booking: { name: string };
		shootsAssignments: ShootAssignment[];
	})[];
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
			return response.json();
		},
		enabled: !!shootId,
	});
}
