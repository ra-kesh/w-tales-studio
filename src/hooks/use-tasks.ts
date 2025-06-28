import { useQuery } from "@tanstack/react-query";
import type { Task } from "@/lib/db/schema";
import { useSearchParams } from "next/navigation";

interface TasksResponse {
	data: Task[];
	total: number;
	pageCount: number;
	limit: number;
}

export async function fetchTasks(
	searchParams: URLSearchParams,
): Promise<TasksResponse> {
	// Append the params to the API call
	const response = await fetch(`/api/tasks?${searchParams.toString()}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch tasks");
	}

	return response.json();
}

export function useTasks() {
	const searchParams = useSearchParams();
	return useQuery({
		queryKey: ["bookings", "task", "list", searchParams.toString()],
		queryFn: () => fetchTasks(searchParams),
	});
}

export function useTaskDetails(taskId: string) {
	return useQuery({
		queryKey: [
			"bookings",
			"task",
			"detail",
			{
				taskId,
			},
		],
		queryFn: async () => {
			const response = await fetch(`/api/tasks/${taskId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch task details");
			}
			return response.json();
		},
		enabled: !!taskId,
	});
}
