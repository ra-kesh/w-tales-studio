import { useQuery } from "@tanstack/react-query";
import type { Configuration } from "@/lib/db/schema";

export async function fetchConfigs(type: string): Promise<Configuration[]> {
	const response = await fetch(`/api/configurations?type=${type}`);
	if (!response.ok) {
		throw new Error("Failed to fetch configurations");
	}
	return response.json();
}

export function useTaskStatuses() {
	return useQuery({
		queryKey: ["configurations", "task_status"],
		queryFn: () => fetchConfigs("task_status"),
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		select: (data) =>
			data.map((config) => ({
				value: config.key,
				label: config.value,
			})),
	});
}

export function useTaskPriorities() {
	return useQuery({
		queryKey: ["configurations", "task_priority"],
		queryFn: () => fetchConfigs("task_priority"),
		staleTime: 5 * 60 * 1000,
		select: (data) =>
			data.map((config) => ({
				value: config.key,
				label: config.value,
			})),
	});
}

// Helper hook to get both statuses and priorities
export function useTaskConfigs() {
	const statuses = useTaskStatuses();
	const priorities = useTaskPriorities();

	return {
		statuses,
		priorities,
		isLoading: statuses.isLoading || priorities.isLoading,
		isError: statuses.isError || priorities.isError,
	};
}

export function usePackageTypes() {
	return useQuery({
		queryKey: ["configurations", "package_type"],
		queryFn: () => fetchConfigs("package_type"),
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		select: (data) =>
			data.map((config) => ({
				value: config.key,
				label: config.value,
				metadata: config.metadata,
			})),
	});
}
export function useBookingTypes() {
	return useQuery({
		queryKey: ["configurations", "booking_type"],
		queryFn: () => fetchConfigs("booking_type"),
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		select: (data) =>
			data.map((config) => ({
				value: config.key,
				label: config.value,
			})),
	});
}
