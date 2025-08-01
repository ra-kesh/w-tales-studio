"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	CheckCircle,
	Clock,
	FileText,
	Link as LinkIcon,
	MessageSquare,
	ThumbsUp,
	UserPlus,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useClaimSubmissionMutation } from "@/hooks/use-submission-mutation";
import { useSession } from "@/lib/auth/auth-client";
import { ReviewSubmissionDialog } from "./_component/review-submission-dialog";

// Helper to get status color and icon
const getStatusProps = (status) => {
	switch (status) {
		case "approved":
			return {
				color: "text-green-600 bg-green-50",
				icon: <CheckCircle className="h-4 w-4" />,
			};
		case "changes_requested":
			return {
				color: "text-red-600 bg-red-50",
				icon: <XCircle className="h-4 w-4" />,
			};
		case "blocked":
			return {
				color: "text-blue-600 bg-blue-50",
				icon: <Clock className="h-4 w-4" />,
			};
		default:
			return {
				color: "text-amber-600 bg-amber-50",
				icon: <Clock className="h-4 w-4" />,
			};
	}
};

export function SubmissionCard({ submission }) {
	const { data: session, isPending } = useSession();

	const user = !isPending && session?.user;
	const myCrewId = !isPending && session?.crewId;

	const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
	const claimMutation = useClaimSubmissionMutation();

	const assignment = submission.task || submission.deliverable;
	const isReadyForReview = submission.status === "ready_for_review";

	// 3. This logic now uses the dynamic crewId from the session
	const isAssignedToMe = submission.currentReviewer === myCrewId;

	const isUnassigned = !submission.currentReviewer;

	const statusProps = getStatusProps(submission.status);

	const handleClaim = () => {
		claimMutation.mutateAsync(submission.id);
	};

	return (
		<>
			<Card className="transition-all hover:shadow-md">
				<CardHeader>
					<div className="flex justify-between items-start gap-4">
						<div className="flex-1">
							<Badge variant="secondary" className="mb-2">
								{submission.assignmentType === "task" ? "Task" : "Deliverable"}
							</Badge>
							<CardTitle className="text-lg leading-tight">
								{assignment.description || assignment.title}
							</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								For Booking:{" "}
								<span className="font-medium text-foreground">
									{assignment.booking.name}
								</span>
							</p>
						</div>
						<div className="flex-shrink-0">
							<div className="flex items-center gap-2">
								<Avatar className="h-8 w-8">
									<AvatarFallback>
										{submission.submittedBy.name?.charAt(0).toUpperCase() ??
											"?"}
									</AvatarFallback>
								</Avatar>
								<div className="text-sm">
									<p className="font-medium">{submission.submittedBy.name}</p>
									<p className="text-xs text-muted-foreground">
										Submitted{" "}
										{formatDistanceToNow(new Date(submission.submittedAt), {
											addSuffix: true,
										})}
									</p>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{submission.comment && (
						<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
							<MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
							<p className="text-sm text-foreground/80">{submission.comment}</p>
						</div>
					)}
					{(submission.powLinks?.length > 0 ||
						submission.files?.length > 0) && (
						<div>
							<h4 className="text-sm font-semibold mb-2 text-muted-foreground">
								Proof of Work
							</h4>
							<div className="space-y-2">
								{submission.powLinks.map((link: string, index: number) => (
									<a
										key={`link-${index}`}
										href={link}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
									>
										<LinkIcon className="h-4 w-4" />
										<span className="truncate">{link}</span>
									</a>
								))}
								{submission.files.map((file: any) => (
									<a
										key={file.id}
										href={file.filePath}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
									>
										<FileText className="h-4 w-4" />
										<span className="truncate">{file.fileName}</span>
									</a>
								))}
							</div>
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-between items-center bg-muted/50 p-4">
					<div className="flex items-center gap-2">
						<div
							className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${statusProps.color}`}
						>
							{statusProps.icon}
							{submission.status.replace(/_/g, " ")}
						</div>
						{/* 4. (Bonus Improvement) Display the actual reviewer's name */}
						{submission.currentReviewer ? (
							<p className="text-xs text-muted-foreground">
								Assigned to:{" "}
								<span className="font-semibold">
									{isAssignedToMe ? "You" : submission.currentReviewer.name}
								</span>
							</p>
						) : (
							isReadyForReview && (
								<p className="text-xs font-semibold text-amber-600">
									Unassigned
								</p>
							)
						)}
					</div>

					<div className="flex gap-2">
						{isReadyForReview && isUnassigned && (
							<Button
								size="sm"
								variant="outline"
								onClick={handleClaim}
								disabled={claimMutation.isPending}
							>
								<UserPlus className="mr-2 h-4 w-4" />
								{claimMutation.isPending ? "Claiming..." : "Claim Review"}
							</Button>
						)}
						{isReadyForReview && isAssignedToMe && (
							<Button
								size="sm"
								variant="default"
								onClick={() => setIsReviewDialogOpen(true)}
							>
								<ThumbsUp className="mr-2 h-4 w-4" />
								Review
							</Button>
						)}
					</div>
				</CardFooter>
			</Card>

			<ReviewSubmissionDialog
				submissionId={submission.id}
				isOpen={isReviewDialogOpen}
				onOpenChange={setIsReviewDialogOpen}
			/>
		</>
	);
}
