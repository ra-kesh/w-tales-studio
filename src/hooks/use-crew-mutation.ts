import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CrewFormValues } from "@/app/(dashboard)/crews/_components/crew-form-schema";
import { toast } from "sonner";

export function useCreateCrewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CrewFormValues) => {
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
		onError: (error) => {
			toast.error(error.message || "Failed to create crew member");
		},
	});
}

export function useUpdateCrewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			crewId,
		}: {
			data: CrewFormValues;
			crewId: string;
		}) => {
			const response = await fetch(`/api/crews/${crewId}`, {
				method: "PUT",
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
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			queryClient.invalidateQueries({
				queryKey: ["crew", { crewId: data.id.toString() }],
			});
			toast.success("Crew member updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update crew member");
		},
	});
}
