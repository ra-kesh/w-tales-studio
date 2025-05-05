import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskFormValues } from "@/app/(dashboard)/tasks/task-form-schema";
import { toast } from "sonner";

export function useCreateTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: TaskFormValues) => {
			const response = await fetch("/api/tasks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create task");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Task created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create Task");
		},
	});
}

export function useUpdateTaskMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			taskId,
		}: {
			data: TaskFormValues;
			taskId: string;
		}) => {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update task");
			}

			return response.json();
		},

		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			queryClient.invalidateQueries({
				queryKey: [
					"task",
					{
						taskId: data.taskId.toString(),
					},
				],
			});
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			toast.success("task updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update task");
		},
	});
}
