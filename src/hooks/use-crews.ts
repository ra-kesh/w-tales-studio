import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Crew } from "@/lib/db/schema";

interface CrewsResponse {
	data: (Crew & {
		member: {
			id: string;
			organizationId: string;
			userId: string;
			role: string;
			createdAt: string;
			user: {
				name: string | null;
				email: string | null;
				image: string | null;
			};
		} | null;
	})[];
	total: number;
	page: number;
	limit: number;
}

interface CreateCrewInput {
	name?: string;
	email?: string;
	phoneNumber?: string;
	equipment?: string[];
	role?: string;
	specialization?: string;
}

interface UpdateCrewInput extends CreateCrewInput {
	id: number;
	status?: string;
}

export async function fetchCrews(): Promise<CrewsResponse> {
	const response = await fetch(`/api/crews`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch crews");
	}

	return response.json();
}

export function useCrews() {
	return useQuery({
		queryKey: ["crews"],
		queryFn: () => fetchCrews(),
	});
}

export function useCrewDetail(crewId: string) {
	return useQuery({
		queryKey: ["crew", { crewId }],
		queryFn: async () => {
			const response = await fetch(`/api/crews/${crewId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch crew details");
			}
			return response.json();
		},
		enabled: !!crewId,
	});
}

export function useCreateCrewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCrewInput) => {
			const response = await fetch("/api/crews", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();

				throw new Error(
					errorData.message || `Request failed with status ${response.status}`,
				);
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			toast.success("Crew member created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useUpdateCrewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateCrewInput) => {
			const response = await fetch("/api/crews", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();

				throw new Error(
					errorData.message || `Request failed with status ${response.status}`,
				);
			}

			return response.json();
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			queryClient.invalidateQueries({
				queryKey: ["crew", { crewId: data.id }],
			});
			toast.success("Crew member updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useDeleteCrewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/crews?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();

				throw new Error(
					errorData.message || `Request failed with status ${response.status}`,
				);
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			toast.success("Crew member deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
