import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Configuration, NewConfiguration } from "@/lib/db/schema";
import { toast } from "sonner";

export async function fetchConfigs(type: string): Promise<Configuration[]> {
	const response = await fetch(`/api/configurations?type=${type}`);
	if (!response.ok) {
		throw new Error("Failed to fetch configurations");
	}
	return response.json();
}

// Remove API call and use static values for task statuses
export function useTaskStatuses() {
	const statuses = [
		{ value: "todo", label: "To Do" },
		{ value: "in_progress", label: "In Progress" },
		{ value: "in_review", label: "In Review" },
		{ value: "in_revision", label: "In Revision" },
		{ value: "completed", label: "Completed" },
	];

	return {
		data: statuses,
		isLoading: false,
		isError: false,
	};
}

// Remove API call and use static values for task priorities
export function useTaskPriorities() {
	const priorities = [
		{ value: "low", label: "Low" },
		{ value: "medium", label: "Medium" },
		{ value: "high", label: "High" },
		{ value: "critical", label: "Critical" },
	];

	return {
		data: priorities,
		isLoading: false,
		isError: false,
	};
}

// Helper hook to get both statuses and priorities
export function useTaskConfigs() {
	const statuses = useTaskStatuses();
	const priorities = useTaskPriorities();

	return {
		statuses,
		priorities,
		isLoading: false,
		isError: false,
	};
}

interface PackageMetadata {
	defaultCost: string;
	durationUnit: string;
	commercial_use: boolean | null;
	isCustomizable: boolean;
	defaultDeliverables: Array<{
		title: string;
		quantity: string;
		is_package_included: boolean;
	}>;
}

export function usePackageTypes() {
	return useQuery({
		queryKey: ["configurations", "package_type"],
		queryFn: () => fetchConfigs("package_type"),
		staleTime: 5 * 60 * 1000,
		select: (data) =>
			data.map((config) => ({
				id: config.id,
				value: config.key,
				label: config.value,
				metadata: config.metadata as PackageMetadata,
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

export async function fetchConfigById(id: string): Promise<Configuration> {
	const response = await fetch(`/api/configurations/${id}`);
	if (!response.ok) {
		throw new Error("Failed to fetch configuration");
	}
	return response.json();
}

export function usePackageDetail(id: string | null) {
	return useQuery({
		queryKey: ["configurations", "package_type", id],
		queryFn: () => fetchConfigById(id as string),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
		select: (data) => ({
			id: data.id,
			key: data.key,
			value: data.value,
			metadata: data.metadata as PackageMetadata,
		}),
	});
}

export function useCreatePackageMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Omit<NewConfiguration, "type" | "key">) => {
			const response = await fetch("/api/configurations/package_types", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data, type: "package_type" }),
			});
			if (!response.ok) {
				throw new Error("Failed to create package");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "package_type"],
			});
			toast.success("Package created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create package");
		},
	});
}

export function useUpdatePackageMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			data,
			packageId,
		}: {
			data: Partial<NewConfiguration>;
			packageId: string;
		}) => {
			const response = await fetch(
				`/api/configurations/package_types/${packageId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...data, type: "package_type" }),
				},
			);
			if (!response.ok) {
				throw new Error("Failed to update package");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "package_type"],
			});
			toast.success("Package updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update package");
		},
	});
}
