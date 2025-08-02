// components/assignments/submission-card.tsx (Refactored)
"use client";

import { formatDistanceToNow } from "date-fns";
import {
	CheckCircle,
	Clock,
	FileText,
	Link as LinkIcon,
	Loader2,
	MessageSquare,
	ThumbsUp,
	UserPlus,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useSession } from "@/lib/auth/auth-client"; // Ensure path is correct
import type {
	SubmissionFile,
	SubmissionWithRelations,
} from "@/types/submission";
import { ReviewSubmissionDialog } from "./_component/review-submission-dialog";

// Helper to get status color and icon (unchanged)
const getStatusProps = (status: string) => {
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

export function SubmissionCard({
	submission,
}: {
	submission: SubmissionWithRelations;
}) {
	console.log({ submission });

	const { data: session, isPending } = useSession();
	const myCrewId = !isPending && session?.crewId;

	const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
	const [isLoadingFileKey, setIsLoadingFileKey] = useState<string | null>(null);
	const claimMutation = useClaimSubmissionMutation();

	const assignment = submission.task || submission.deliverable;
	const isReadyForReview = submission.status === "ready_for_review";

	const isAssignedToMe = submission.currentReviewer?.id === myCrewId;
	const isUnassigned = !submission.currentReviewer;

	const statusProps = getStatusProps(submission.status);

	const handleClaim = () => {
		claimMutation.mutate(submission.id);
	};

	const handleFileView = async (file: SubmissionFile) => {
		const key = new URL(file.filePath).pathname.substring(1);
		setIsLoadingFileKey(key);
		try {
			const res = await fetch("/api/uploads/file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key }),
			});
			if (!res.ok) throw new Error("Could not get download link.");
			const { url } = await res.json();
			window.open(url, "_blank");
		} catch (error) {
			toast.error("Failed to open file.");
		} finally {
			setIsLoadingFileKey(null);
		}
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
								{submission.assignmentType === "task"
									? assignment?.description
									: assignment?.title}
							</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								For Booking:{" "}
								<span className="font-medium text-foreground">
									{assignment?.booking?.name}
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
								<p className="text-sm font-medium">
									{submission.submittedBy.name}
								</p>
							</div>
							<div className="text-sm">
								<p className="text-xs text-muted-foreground">
									{/* Submitted{" "} */}
									{formatDistanceToNow(new Date(submission.submittedAt), {
										addSuffix: true,
									})}
								</p>
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
								{/* --- THE FIX: Use button with onClick handler for files --- */}
								{submission.files.map((file: SubmissionFile) => {
									const key = new URL(file.filePath).pathname.substring(1);
									return (
										<button
											key={file.id}
											onClick={() => handleFileView(file)}
											disabled={isLoadingFileKey === key}
											className="flex w-full items-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-50 text-left"
										>
											{isLoadingFileKey === key ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<FileText className="h-4 w-4" />
											)}
											<span className="truncate">{file.fileName}</span>
										</button>
									);
								})}
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
