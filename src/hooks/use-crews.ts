import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Crew } from "@/lib/db/schema";
import { toast } from "sonner";

interface CrewsResponse {
	data: (Crew & {
		memberName?: string | null;
		memberEmail?: string | null;
	})[];
	total: number;
	page: number;
	limit: number;
}

interface CreateCrewInput {
	memberId?: string;
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

export async function fetchCrews(page = 1, limit = 10): Promise<CrewsResponse> {
	const response = await fetch(`/api/crews?page=${page}&limit=${limit}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch crews");
	}

	return response.json();
}

export function useCrews(page?: number, limit?: number) {
	return useQuery({
		queryKey: ["crews", { page, limit }],
		queryFn: () => fetchCrews(page, limit),
		placeholderData: { data: [], total: 0, page: 1, limit: 10 },
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
				throw new Error("Failed to create crew member");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			toast.success("Crew member created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create crew member");
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
				throw new Error("Failed to update crew member");
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
			toast.error(error.message || "Failed to update crew member");
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
				throw new Error("Failed to delete crew member");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			toast.success("Crew member deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete crew member");
		},
	});
}
