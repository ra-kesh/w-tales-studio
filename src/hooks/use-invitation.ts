"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient, organization } from "@/lib/auth/auth-client";
import { toast } from "sonner";

async function getInvitationDetails(invitationId: string) {
	const response = await authClient.organization.getInvitation({
		query: { id: invitationId },
	});

	if (response.error) {
		throw new Error(
			response.error.message || "Invitation not found or has expired.",
		);
	}
	return response.data;
}

export function useInvitationQuery(invitationId: string) {
	return useQuery({
		queryKey: ["invitation", invitationId],
		queryFn: () => getInvitationDetails(invitationId),
		enabled: !!invitationId,
		retry: false,
	});
}

async function acceptAndCreateCrew(invitationId: string) {
	const acceptanceResponse = await organization.acceptInvitation({
		invitationId,
	});

	if (acceptanceResponse.error) {
		throw new Error(
			acceptanceResponse.error.message || "Failed to accept invitation.",
		);
	}

	fetch("/api/crews/from-member", { method: "POST" }).catch((err) => {
		console.error("Silent error: Failed to auto-create crew member.", err);
		toast.warning(
			"Welcome! There was an issue adding you to the crew list automatically.",
		);
	});

	return acceptanceResponse.data;
}

export function useAcceptInvitationMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: acceptAndCreateCrew,
		onSuccess: () => {
			toast.success("Invitation accepted! Welcome aboard. Redirecting...");
			queryClient.invalidateQueries({ queryKey: ["crews"] });
			setTimeout(() => {
				window.location.href = "/home";
			}, 1500);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

async function rejectInvitation(invitationId: string) {
	const response = await organization.rejectInvitation({ invitationId });
	if (response.error) {
		throw new Error(response.error.message || "Failed to decline invitation.");
	}
	return response.data;
}

export function useRejectInvitationMutation() {
	return useMutation({
		mutationFn: rejectInvitation,
		onSuccess: () => {
			toast.info("Invitation has been declined.");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
