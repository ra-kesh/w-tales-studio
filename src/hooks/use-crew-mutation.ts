import { useSession } from "@/lib/auth/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CrewMutationParams {
	id?: number;
	name: string;
	email: string;
	role: string;
	specialization: string;
	status: string;
	equipment: string[];
}

export function useCrewMutation() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation({
		mutationFn: async (data: CrewMutationParams) => {
			const response = await fetch("/api/crews", {
				method: data.id ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					organizationId: session?.session.activeOrganizationId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save crew member");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			toast.success("Crew member saved successfully");
		},
		onError: (error) => {
			toast.error("Failed to save crew member");
			console.error("Mutation error:", error);
		},
	});
}
