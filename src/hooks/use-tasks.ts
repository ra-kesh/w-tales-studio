import { useQuery } from "@tanstack/react-query";
import type { Task } from "@/lib/db/schema";

interface TasksResponse {
	data: Task[];
	total: number;
}

export async function fetchTasks(): Promise<TasksResponse> {
	const response = await fetch("/api/tasks", {
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
	return useQuery({
		queryKey: ["tasks"],
		queryFn: fetchTasks,
		placeholderData: { data: [], total: 0 },
	});
}
