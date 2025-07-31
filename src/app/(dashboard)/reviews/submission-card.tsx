"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	CheckCircle,
	Clock,
	FileText,
	Link as LinkIcon,
	MessageSquare,
	ThumbsDown,
	ThumbsUp,
	User,
	UserPlus,
	XCircle,
} from "lucide-react";
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

// Assuming you have a hook to get the current manager's ID
// import { useCurrentUser } from "@/hooks/use-current-user";

// TODO: Define your mutation hooks here
// const useClaimReviewMutation = () => ({ mutate: (id) => console.log(`Claiming ${id}`) });
// const useApproveSubmissionMutation = () => ({ mutate: (data) => console.log('Approving', data) });
// const useRejectSubmissionMutation = () => ({ mutate: (data) => console.log('Rejecting', data) });

// Helper to get status color and icon
const getStatusProps = (status) => {
	switch (status) {
		case "approved":
			return {
				color: "text-green-600 bg-green-50",
				icon: <CheckCircle className="h-4 w-4" />,
			};
		case "rejected":
			return {
				color: "text-red-600 bg-red-50",
				icon: <XCircle className="h-4 w-4" />,
			};
		case "in_progress":
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
	// const { user } = useCurrentUser();
	const myUserId = 7; // Placeholder for the current manager's ID. Replace with actual user ID from your auth hook.

	const assignment = submission.task || submission.deliverable;
	const isAssignedToMe = submission.currentReviewer === myUserId; // Note: Your API response returns just the ID for currentReviewer
	const isUnassigned = !submission.currentReviewer;
	const isReadyForReview = submission.status === "ready_for_review";

	const statusProps = getStatusProps(submission.status);

	// TODO: Implement your mutations
	// const claimMutation = useClaimReviewMutation();
	// const approveMutation = useApproveSubmissionMutation();
	// const rejectMutation = useRejectSubmissionMutation();

	const handleClaim = () => {
		// claimMutation.mutate(submission.id);
		console.log(`Claiming submission ${submission.id}`);
	};

	const handleApprove = () => {
		// approveMutation.mutate({ submissionId: submission.id, comment: "Looks great!" });
		console.log(`Approving submission ${submission.id}`);
	};

	const handleReject = () => {
		// rejectMutation.mutate({ submissionId: submission.id, comment: "Needs changes." });
		console.log(`Rejecting submission ${submission.id}`);
	};

	return (
		<Card className="transition-all hover:shadow-md">
			<CardHeader>
				<div className="flex justify-between items-start gap-4">
					{/* Left Side: Assignment Details */}
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

					{/* Right Side: Submitter Info */}
					<div className="flex-shrink-0">
						<div className="flex items-center gap-2">
							<Avatar className="h-8 w-8">
								{/* <AvatarImage src={submission.submittedBy.avatarUrl} /> */}
								<AvatarFallback>
									{submission.submittedBy.name.charAt(0).toUpperCase()}
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
				{/* Submitter's Comment */}
				{submission.comment && (
					<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
						<MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
						<p className="text-sm text-foreground/80">{submission.comment}</p>
					</div>
				)}

				{/* Proof of Work Section */}
				{(submission.powLinks?.length > 0 || submission.files?.length > 0) && (
					<div>
						<h4 className="text-sm font-semibold mb-2 text-muted-foreground">
							Proof of Work
						</h4>
						<div className="space-y-2">
							{submission.powLinks.map((link, index) => (
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
							{submission.files.map((file) => (
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
				{/* Left Side: Status Info */}
				<div className="flex items-center gap-2">
					<div
						className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${statusProps.color}`}
					>
						{statusProps.icon}
						{submission.status.replace("_", " ")}
					</div>
					{submission.currentReviewer ? (
						<p className="text-xs text-muted-foreground">
							Assigned to:{" "}
							<span className="font-semibold">
								{isAssignedToMe ? "You" : "Another Manager"}
							</span>
						</p>
					) : (
						isReadyForReview && (
							<p className="text-xs font-semibold text-amber-600">Unassigned</p>
						)
					)}
				</div>

				{/* Right Side: Action Buttons */}
				<div className="flex gap-2">
					{isReadyForReview && isUnassigned && (
						<Button size="sm" variant="outline" onClick={handleClaim}>
							<UserPlus className="mr-2 h-4 w-4" />
							Claim Review
						</Button>
					)}
					{isReadyForReview && isAssignedToMe && (
						<>
							<Button
								size="sm"
								variant="outline"
								className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
								onClick={handleReject}
							>
								<ThumbsDown className="mr-2 h-4 w-4" />
								Reject
							</Button>
							<Button size="sm" variant="default" onClick={handleApprove}>
								<ThumbsUp className="mr-2 h-4 w-4" />
								Approve
							</Button>
						</>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
