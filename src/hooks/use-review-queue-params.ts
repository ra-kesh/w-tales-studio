// hooks/use-review-queue-params.ts
"use client";

import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

export function useReviewQueueParams() {
	const [assignmentType, setAssignmentType] = useQueryState(
		"assignmentType",
		parseAsString.withDefault("all"),
	);

	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault("ready_for_review"),
	);

	const [assignedToMe, setAssignedToMe] = useQueryState(
		"assignedToMe",
		parseAsBoolean.withDefault(false), // Defaults to false.
	);

	// We can create a helper function to set multiple params at once if needed,
	// but for simplicity, we'll return the individual setters.
	return {
		assignmentType,
		setAssignmentType,
		status,
		setStatus,
		assignedToMe,
		setAssignedToMe,
	};
}
