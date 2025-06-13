// lib/hooks/use-assignments.ts
"use client";

import type {
	DeliverablesAssignment,
	ExpensesAssignment,
	ShootsAssignment,
	TasksAssignment,
} from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

interface Booking {
	id: number;
	name: string;
}

export interface AssignmentsData {
	data: {
		shoots?: ShootsAssignment[];
		tasks?: TasksAssignment[];
		deliverables?: DeliverablesAssignment[];
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
