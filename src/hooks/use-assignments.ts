// lib/hooks/use-assignments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod/v4";
import type {
	DeliverablesAssignment,
	ExpensesAssignment,
	ShootsAssignment,
	TasksAssignment,
} from "@/lib/db/schema";
import type { DeliverableAssignmentWithRelations } from "@/types/deliverables";
import type { TaskAssignmentWithRelations } from "@/types/task";

interface Booking {
	id: number;
	name: string;
}

export interface AssignmentsData {
	data: {
		shoots?: ShootsAssignment[];
		tasks?: TaskAssignmentWithRelations[];
		deliverables?: DeliverableAssignmentWithRelations[];
		expenses?: ExpensesAssignment[];
	};
	pagination: Record<string, { total: number; page: number; pageSize: number }>;
}

// Define a schema for the filters our hook will accept
export const assignmentFiltersSchema = z.object({
	types: z.array(z.string()).optional(),
	status: z.string().optional(),
	page: z.number().optional(),
	pageSize: z.number().optional(),
});

export type AssignmentFilters = z.infer<typeof assignmentFiltersSchema>;

/**
 * Fetches assignment data from the API.
 * This function is separated to be reusable on both client and server.
 */
const getAssignments = async (
	filters: AssignmentFilters,
): Promise<AssignmentsData> => {
	const params = new URLSearchParams();

	if (filters.types?.length) params.set("types", filters.types.join(","));
	if (filters.status) params.set("status", filters.status);
	if (filters.page) params.set("page", filters.page.toString());
	if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());

	const response = await fetch(`/api/me/assignments?${params.toString()}`);

	if (!response.ok) {
		throw new Error("Failed to fetch assignments");
	}

	return response.json();
};

/**
 * Custom hook to fetch user assignments with TanStack Query.
 * @param filters - Optional filters for the query.
 */
export const useAssignments = (filters: AssignmentFilters = {}) => {
	return useQuery<AssignmentsData, Error>({
		queryKey: ["assignments", filters],
		queryFn: () => getAssignments(filters),
	});
};

const fetchAssignmentSubmissions = async (
	type: "task" | "deliverable",
	id: number,
) => {
	const res = await fetch(`/api/me/assignments/${type}/${id}/submissions`);
	if (!res.ok) {
		throw new Error("Failed to fetch submission history");
	}
	return res.json();
};

export const useAssignmentSubmissions = (
	type: "task" | "deliverable",
	id: number,
) => {
	return useQuery({
		queryKey: ["submissions", type, id],
		queryFn: () => fetchAssignmentSubmissions(type, id),
		// --- THIS IS THE KEY ---
		// The query will NOT run automatically on component mount.
		// It will only run when we call the `refetch` function.
		enabled: false,
	});
};
