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
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create task");
			}

			return response.json();
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
			queryClient.invalidateQueries({ queryKey: ["bookings", "task", "list"] });
			// queryClient.invalidateQueries({ queryKey: ["crews"] });
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			toast.success("Task created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create task");
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
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update task");
			}

			return response.json();
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
			queryClient.invalidateQueries({ queryKey: ["bookings", "task", "list"] });
			// queryClient.invalidateQueries({ queryKey: ["crews"] });
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"task",
					"detail",
					{
						taskId: data.taskId.toString(),
					},
				],
			});
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			toast.success("Task updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update task");
		},
	});
}