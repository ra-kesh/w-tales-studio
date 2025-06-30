"use client";

import { format } from "date-fns";
import { CheckCircle, Clock, Loader2, Mail, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CopyButton from "@/components/copy-button";
import CreateOrganizationDialog from "@/components/create-organisation-dialog";
import InviteMemberDialog from "@/components/invite-member-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import type { ActiveOrganization } from "@/types/auth";

export function TeamInvites({
	activeOrganization,
}: {
	activeOrganization: ActiveOrganization | null;
}) {
	const [isRevoking, setIsRevoking] = useState<string[]>([]);

	if (!activeOrganization) {
		return (
			<div className="flex items-center justify-center h-[70vh]">
				<Card className="w-[400px]">
					<CardHeader>
						<CardTitle className="text-center">No Organization Found</CardTitle>
						<CardDescription className="text-center">
							You don't have an active organization.
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex justify-center">
						<CreateOrganizationDialog />
					</CardFooter>
				</Card>
			</div>
		);
	}

	const pendingInvitations = activeOrganization?.invitations.filter(
		(inv) => inv.status === "pending",
	);
	const acceptedInvitations = activeOrganization?.invitations.filter(
		(inv) => inv.status === "accepted",
	);

	const router = useRouter();

	const pathName = usePathname();

	return (
		<>
			{pendingInvitations.length > 0 ? (
				<Card>
					<CardHeader className="flex justify-between items-center">
						<div>
							<CardTitle>Pending Invitations</CardTitle>
							<CardDescription>
								These invitations are waiting for a response.
							</CardDescription>
						</div>
						<div>
							<InviteMemberDialog />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{pendingInvitations.map((invitation) => (
								<div
									key={invitation.id}
									className="flex items-center justify-between p-3"
								>
									<div className="flex items-center space-x-4">
										<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
											<Mail className="h-5 w-5 text-muted-foreground" />
										</div>
										<div>
											<p className="font-normal">{invitation.email}</p>
											<p className="text-xs text-muted-foreground">
												Expires{" "}
												{format(new Date(invitation.expiresAt), "MMM dd, yyyy")}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<Badge variant="outline">{invitation.role}</Badge>
										<Badge
											variant="secondary"
											className="flex items-center gap-1"
										>
											<Clock className="h-3 w-3" /> Pending
										</Badge>
										<div className="flex items-center gap-2">
											<Button
												disabled={isRevoking.includes(invitation.id)}
												size="sm"
												variant="outline"
												onClick={() => {
													authClient.organization.cancelInvitation(
														{
															invitationId: invitation.id,
														},
														{
															onRequest: () => {
																setIsRevoking([...isRevoking, invitation.id]);
															},
															onSuccess: () => {
																toast.message(
																	"Invitation revoked successfully",
																);
																setIsRevoking(
																	isRevoking.filter(
																		(id) => id !== invitation.id,
																	),
																);

																router.refresh();
															},
															onError: (ctx) => {
																toast.error(ctx.error.message);
																setIsRevoking(
																	isRevoking.filter(
																		(id) => id !== invitation.id,
																	),
																);
																router.refresh();
															},
														},
													);
												}}
											>
												{isRevoking.includes(invitation.id) ? (
													<Loader2 className="animate-spin" size={16} />
												) : (
													"Revoke"
												)}
											</Button>
											<div>
												<CopyButton
													textToCopy={`${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://studsol.com"}/sign-in?redirect=/accept-invitation/${invitation.id}`}
												/>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-10">
						<Mail className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium">No Pending Invitations</h3>
						<p className="text-muted-foreground text-center max-w-md mt-1">
							You don't have any pending invitations. Invite new members to join
							your organization.
						</p>
						<div className="mt-4">
							<InviteMemberDialog />
						</div>
					</CardContent>
				</Card>
			)}

			{acceptedInvitations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Accepted Invitations</CardTitle>
						<CardDescription>
							These invitations have been accepted.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{acceptedInvitations.map((invitation) => (
								<div
									key={invitation.id}
									className="flex items-center justify-between p-3"
								>
									<div className="flex items-center space-x-4">
										<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
											<Mail className="h-5 w-5 text-muted-foreground" />
										</div>
										<div>
											<p className="font-normal">{invitation.email}</p>
											<p className="text-xs text-muted-foreground">Accepted</p>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<Badge variant="outline">{invitation.role}</Badge>
										<Badge
											variant="default"
											className="bg-green-100 text-green-800 flex items-center gap-1"
										>
											<CheckCircle className="h-3 w-3" /> Accepted
										</Badge>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
