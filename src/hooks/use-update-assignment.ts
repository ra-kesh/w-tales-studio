"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function updateAssignment(payload: any) {
	const response = await fetch("/api/submissions", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Submission failed");
	}

	return response.json();
}

export function useUpdateAssignmentMutation({
	onSuccess,
}: {
	onSuccess?: () => void;
} = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateAssignment,
		onMutate: () => {
			const toastId = toast.loading("Updating assignment...");
			return { toastId };
		},
		onSuccess: (data, variables, context) => {
			if (context?.toastId) {
				toast.dismiss(context.toastId);
			}
			toast.success("Assignment updated successfully!");

			queryClient.invalidateQueries({ queryKey: ["assignments"] });
			queryClient.invalidateQueries({ queryKey: ["all-task-assignments"] });
			queryClient.invalidateQueries({
				queryKey: ["all-deliverable-assignments"],
			});

			if (onSuccess) {
				onSuccess();
			}
		},
		onError: (error: Error, variables, context) => {
			if (context?.toastId) {
				toast.dismiss(context.toastId);
			}
			toast.error("Update Failed", {
				description: error.message || "An unknown error occurred.",
			});
		},
	});
}
