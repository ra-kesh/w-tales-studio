"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckIcon, XIcon, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationError } from "./invitation-error";
import {
	useAcceptInvitationMutation,
	useInvitationQuery,
	useRejectInvitationMutation,
} from "@/hooks/use-invitation";

export default function InvitationPage() {
	const params = useParams<{ id: string }>();

	const {
		data: invitation,
		isLoading: isLoadingInvitation,
		isError: isInvitationError,
	} = useInvitationQuery(params.id);

	const {
		mutate: accept,
		isPending: isAccepting,
		isSuccess: isAccepted,
	} = useAcceptInvitationMutation();

	const {
		mutate: reject,
		isPending: isRejecting,
		isSuccess: isRejected,
	} = useRejectInvitationMutation();

	if (isLoadingInvitation) {
		return (
			<div className="min-h-[80vh] flex items-center justify-center">
				<InvitationSkeleton />
			</div>
		);
	}

	if (isInvitationError) {
		return (
			<div className="min-h-[80vh] flex items-center justify-center">
				<InvitationError />
			</div>
		);
	}

	const isProcessing = isAccepting || isRejecting;
	const hasResponded = isAccepted || isRejected;

	return (
		<div className="min-h-[80vh] flex items-center justify-center">
			<div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Organization Invitation</CardTitle>
					<CardDescription>
						You've been invited to join an organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isAccepted ? (
						<SuccessView organizationName={invitation?.organizationName} />
					) : isRejected ? (
						<RejectedView organizationName={invitation?.organizationName} />
					) : (
						<PendingView
							inviterEmail={invitation?.inviterEmail}
							organizationName={invitation?.organizationName}
							inviteeEmail={invitation?.email}
						/>
					)}
				</CardContent>
				{!hasResponded && (
					<CardFooter className="flex justify-between">
						<Button
							variant="outline"
							onClick={() => reject(params.id)}
							disabled={isProcessing}
						>
							{isRejecting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								"Decline"
							)}
						</Button>
						<Button onClick={() => accept(params.id)} disabled={isProcessing}>
							{isAccepting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Accepting...
								</>
							) : (
								"Accept Invitation"
							)}
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}

const PendingView = ({
	inviterEmail,
	organizationName,
	inviteeEmail,
}: {
	inviterEmail?: string;
	organizationName?: string;
	inviteeEmail?: string;
}) => (
	<div className="space-y-4">
		<p>
			<strong>{inviterEmail}</strong> has invited you to join{" "}
			<strong>{organizationName}</strong>.
		</p>
		<p>
			This invitation was sent to <strong>{inviteeEmail}</strong>.
		</p>
	</div>
);

const SuccessView = ({ organizationName }: { organizationName?: string }) => (
	<div className="space-y-4 text-center">
		<div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
			<CheckIcon className="w-8 h-8 text-green-600" />
		</div>
		<h2 className="text-2xl font-bold">Welcome to {organizationName}!</h2>
		<p>You've successfully joined the organization.</p>
	</div>
);

const RejectedView = ({ organizationName }: { organizationName?: string }) => (
	<div className="space-y-4 text-center">
		<div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
			<XIcon className="w-8 h-8 text-red-600" />
		</div>
		<h2 className="text-2xl font-bold">Invitation Declined</h2>
		<p>You have declined the invitation to join {organizationName}.</p>
	</div>
);

function InvitationSkeleton() {
	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<Skeleton className="w-6 h-6 rounded-full" />
					<Skeleton className="h-6 w-24" />
				</div>
				<Skeleton className="h-4 w-full mt-2" />
				<Skeleton className="h-4 w-2/3 mt-2" />
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</CardContent>
			<CardFooter className="flex justify-end">
				<Skeleton className="h-10 w-24" />
			</CardFooter>
		</Card>
	);
}
