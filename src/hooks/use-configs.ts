import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";
import type {
	ConfigType,
	Configuration,
	NewConfiguration,
} from "@/lib/db/schema";

export type ConfigTypeKey = (typeof ConfigType.enumValues)[number];

export async function fetchConfigs(
	type: ConfigTypeKey,
): Promise<Configuration[]> {
	const response = await fetch(`/api/configurations?type=${type}`);
	if (!response.ok) {
		throw new Error("Failed to fetch configurations");
	}
	return response.json();
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ConfigOption<Meta = any> = {
	id: number;
	value: string; // the config.key
	label: string; // the config.value
	metadata?: Meta; // optional metadata
};

/**
 * Generic hook to load a list of configurations for the active org.
 * @param type  one of your ConfigType enum values, e.g. "booking_type"
 */

export function useConfigs<ConfigOption>(type: ConfigTypeKey) {
	const { data: session } = useSession();

	return useQuery({
		// queryKey: ["configurations", type, session?.session.activeOrganizationId],
		queryKey: ["configurations", type],
		queryFn: () => fetchConfigs(type),
		enabled: Boolean(session?.session.activeOrganizationId),
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

export const usePackageTypes = () =>
	useConfigs<PackageMetadata>("package_type");

export const useBookingTypes = () => useConfigs("booking_type");

export const useDeliverablesStatuses = () => useConfigs("deliverable_status");

export const useTaskPriorities = () => useConfigs("task_priority");
export const useTaskStatuses = () => useConfigs("task_status");

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

export function useBookingTypeDetail(id: string | null) {
	return useQuery({
		queryKey: ["configurations", "booking_type", id],
		queryFn: () => fetchConfigById(id as string),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
		select: (data) => ({
			id: data.id,
			key: data.key,
			value: data.value,
			metadata: data.metadata,
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
			queryClient.invalidateQueries({
				queryKey: ["onboarding"],
			});
			toast.success("Package created successfully");
			queryClient.refetchQueries({
				queryKey: ["onboarding"],
			});
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create package");
		},
	});
}

export function useCreateBookingTypeMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (
			data: Omit<NewConfiguration, "type" | "key" | "metadata">,
		) => {
			const response = await fetch("/api/configurations/booking_types", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data, type: "booking_type" }),
			});
			if (!response.ok) {
				throw new Error("Failed to create booking type");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "booking_type"],
			});
			toast.success("Booking type created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create booking type");
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

export function useUpdateBookingTypeMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			data,
			bookingTypeId,
		}: {
			data: Partial<NewConfiguration>;
			bookingTypeId: string;
		}) => {
			const response = await fetch(
				`/api/configurations/booking_types/${bookingTypeId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...data, type: "booking_type" }),
				},
			);
			if (!response.ok) {
				throw new Error("Failed to update booking type");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "booking_type"],
			});
			toast.success("Booking type updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update booking type");
		},
	});
}

export function useDeleteBookingTypeMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (bookingTypeId: string) => {
			const response = await fetch(
				`/api/configurations/booking_types/${bookingTypeId}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				throw new Error("Failed to delete booking type");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "booking_type"],
			});
			toast.success("Booking type deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete booking type");
		},
	});
}

export function useDeliverableStatusDetail(id: string | null) {
	return useQuery({
		queryKey: ["configurations", "deliverable_status", id],
		queryFn: () => fetchConfigById(id as string),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
		select: (data) => ({
			id: data.id,
			key: data.key,
			value: data.value,
			metadata: data.metadata,
		}),
	});
}

export function useCreateDeliverableStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (
			data: Omit<NewConfiguration, "type" | "key" | "metadata">,
		) => {
			const response = await fetch("/api/configurations/deliverable_status", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data, type: "deliverable_status" }),
			});
			if (!response.ok) {
				throw new Error("Failed to create deliverable status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "deliverable_status"],
			});
			toast.success("Deliverable status created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create deliverable status");
		},
	});
}

export function useUpdateDeliverableStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			data,
			deliverableStatusId,
		}: {
			data: Partial<NewConfiguration>;
			deliverableStatusId: string;
		}) => {
			const response = await fetch(
				`/api/configurations/deliverable_status/${deliverableStatusId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...data, type: "deliverable_status" }),
				},
			);
			if (!response.ok) {
				throw new Error("Failed to update deliverable status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "deliverable_status"],
			});
			toast.success("Deliverable status updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update deliverable status");
		},
	});
}

export function useDeleteDeliverableStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (deliverableStatusId: string) => {
			const response = await fetch(
				`/api/configurations/deliverable_status/${deliverableStatusId}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				throw new Error("Failed to delete deliverable status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "deliverable_status"],
			});
			toast.success("Deliverable status deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete deliverable status");
		},
	});
}

export function useTaskStatusDetail(id: string | null) {
	return useQuery({
		queryKey: ["configurations", "task_status", id],
		queryFn: () => fetchConfigById(id as string),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
		select: (data) => ({
			id: data.id,
			key: data.key,
			value: data.value,
			metadata: data.metadata,
		}),
	});
}

export function useCreateTaskStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (
			data: Omit<NewConfiguration, "type" | "key" | "metadata">,
		) => {
			const response = await fetch("/api/configurations/task_status", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data, type: "task_status" }),
			});
			if (!response.ok) {
				throw new Error("Failed to create task status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_status"],
			});
			toast.success("Task status created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create task status");
		},
	});
}

export function useUpdateTaskStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			data,
			taskStatusId,
		}: {
			data: Partial<NewConfiguration>;
			taskStatusId: string;
		}) => {
			const response = await fetch(
				`/api/configurations/task_status/${taskStatusId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...data, type: "task_status" }),
				},
			);
			if (!response.ok) {
				throw new Error("Failed to update task status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_status"],
			});
			toast.success("Task status updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update task status");
		},
	});
}

export function useDeleteTaskStatusMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (taskStatusId: string) => {
			const response = await fetch(
				`/api/configurations/task_status/${taskStatusId}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				throw new Error("Failed to delete task status");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_status"],
			});
			toast.success("Task status deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete task status");
		},
	});
}

export function useTaskPriorityDetail(id: string | null) {
	return useQuery({
		queryKey: ["configurations", "task_priority", id],
		queryFn: () => fetchConfigById(id as string),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
		select: (data) => ({
			id: data.id,
			key: data.key,
			value: data.value,
			metadata: data.metadata,
		}),
	});
}

export function useCreateTaskPriorityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (
			data: Omit<NewConfiguration, "type" | "key" | "metadata">,
		) => {
			const response = await fetch("/api/configurations/task_priority", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data, type: "task_priority" }),
			});
			if (!response.ok) {
				throw new Error("Failed to create task priority");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_priority"],
			});
			toast.success("Task priority created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create task priority");
		},
	});
}

export function useUpdateTaskPriorityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			data,
			taskPriorityId,
		}: {
			data: Partial<NewConfiguration>;
			taskPriorityId: string;
		}) => {
			const response = await fetch(
				`/api/configurations/task_priority/${taskPriorityId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...data, type: "task_priority" }),
				},
			);
			if (!response.ok) {
				throw new Error("Failed to update task priority");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_priority"],
			});
			toast.success("Task priority updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update task priority");
		},
	});
}

export function useDeleteTaskPriorityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (taskPriorityId: string) => {
			const response = await fetch(
				`/api/configurations/task_priority/${taskPriorityId}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				throw new Error("Failed to delete task priority");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["configurations", "task_priority"],
			});
			toast.success("Task priority deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete task priority");
		},
	});
}
