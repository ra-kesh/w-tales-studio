// hooks/use-submission-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- Claim Submission Mutation ---
const claimSubmission = async (submissionId: number) => {
	const res = await fetch(`/api/submissions/${submissionId}/claim`, {
		method: "PATCH",
	});
	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "Failed to claim submission");
	}
	return res.json();
};

export const useClaimSubmissionMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: claimSubmission,
		onSuccess: () => {
			toast.success("Review claimed successfully!");
			// This will automatically refresh the submissions list
			queryClient.invalidateQueries({ queryKey: ["submissions"] });
		},
		onError: (error: Error) => {
			toast.error("Failed to Claim", { description: error.message });
		},
	});
};

// --- Review Submission Mutation (Approve/Reject) ---
interface ReviewPayload {
	submissionId: number;
	action: "approve" | "request_changes";
	reviewComment?: string;
}

const reviewSubmission = async (payload: ReviewPayload) => {
	const { submissionId, ...body } = payload;
	const res = await fetch(`/api/submissions/${submissionId}/review`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "Failed to submit review");
	}
	// The PATCH returns 204 No Content, so we don't need to parse JSON
	return true;
};

export const useReviewSubmissionMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reviewSubmission,
		onSuccess: (data, variables) => {
			const successMessage =
				variables.action === "approve"
					? "Submission Approved"
					: "Changes Requested";
			toast.success(successMessage);
			queryClient.invalidateQueries({ queryKey: ["submissions"] });
		},
		onError: (error: Error) => {
			toast.error("Review Failed", { description: error.message });
		},
	});
};
