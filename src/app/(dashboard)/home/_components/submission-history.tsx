"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	FileText,
	Link as LinkIcon,
	Loader2,
	MessageSquare,
	MessageSquareQuote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type {
	SubmissionFile,
	SubmissionWithRelations,
} from "@/types/submission";

function SubmissionStatusBadge({ status }: { status: string }) {
	const props = {
		approved: { text: "Approved", className: "bg-green-100 text-green-800" },
		changes_requested: {
			text: "Changes Requested",
			className: "bg-amber-100 text-amber-800",
		},
		ready_for_review: {
			text: "Ready for Review",
			className: "bg-blue-100 text-blue-800",
		},
	}[status];

	if (!props) return null;

	return (
		<span
			className={`rounded-md px-2 py-1 text-xs font-medium ${props.className}`}
		>
			{props.text}
		</span>
	);
}

export function SubmissionHistoryItem({
	submission,
}: {
	submission: SubmissionWithRelations;
}) {
	const [isLoadingFileKey, setIsLoadingFileKey] = useState<string | null>(null);

	const isReviewed = !!submission.reviewedAt;

	const handleFileView = async (file: SubmissionFile) => {
		// 2. Extract the key from the full filePath URL
		const key = new URL(file.filePath).pathname.substring(1); // Removes the leading '/'
		if (!key) {
			toast.error("Invalid file path.");
			return;
		}

		setIsLoadingFileKey(key);
		try {
			const res = await fetch("/api/uploads/file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key }), // 3. Send the extracted key to the API
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Could not get download link.");
			}

			const { url } = await res.json();
			window.open(url, "_blank");
		} catch (error) {
			toast.error("Failed to open file.", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred.",
			});
		} finally {
			setIsLoadingFileKey(null);
		}
	};

	return (
		<div className="relative pl-8">
			<div className="absolute left-0 top-1 flex h-full w-8 justify-center">
				<span className="h-full w-0.5 bg-gray-200" />
				<span className="absolute top-0 z-10 flex size-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
					{submission.version}
				</span>
			</div>

			<div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback>
								{submission.submittedBy.name?.charAt(0).toUpperCase() ?? "?"}
							</AvatarFallback>
						</Avatar>
						<p className="text-sm">
							<span className="font-semibold">
								{submission.submittedBy.name}
							</span>{" "}
							submitted this version
						</p>
					</div>
					<p className="text-xs text-gray-500">
						{formatDistanceToNow(new Date(submission.submittedAt), {
							addSuffix: true,
						})}
					</p>
				</div>

				{submission.comment && (
					<div className="mt-3 flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
						<MessageSquare className="h-5 w-5 flex-shrink-0 text-gray-500 mt-0.5" />
						<p className="text-sm text-gray-700">{submission.comment}</p>
					</div>
				)}

				{(submission.powLinks?.length > 0 || submission.files?.length > 0) && (
					<div className="mt-3">
						<h4 className="text-xs font-semibold text-gray-500 mb-2">
							Proof of Work Submitted
						</h4>
						<div className="space-y-2 rounded-lg border bg-gray-50 p-3">
							{submission.powLinks.map((link, index) => (
								<a
									key={`link-${index}`}
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
								>
									<LinkIcon className="h-4 w-4" />
									<span className="truncate">{link}</span>
								</a>
							))}
							{submission.files.map((file) => (
								<button
									key={file.id} // 4. Use the file.id for the React key
									onClick={() => handleFileView(file)}
									disabled={
										isLoadingFileKey ===
										new URL(file.filePath).pathname.substring(1)
									}
									className="flex w-full items-center gap-2 text-sm text-indigo-600 hover:underline disabled:opacity-50 text-left"
								>
									{isLoadingFileKey ===
									new URL(file.filePath).pathname.substring(1) ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<FileText className="h-4 w-4" />
									)}
									<span className="truncate">{file.fileName}</span>
								</button>
							))}
						</div>
					</div>
				)}
				{isReviewed ? (
					<div className="mt-4 border-t pt-4">
						<div className="flex justify-between items-center">
							{/* <SubmissionStatusBadge status={submission.status} /> */}
							<p className="text-xs text-gray-500">
								Reviewed by{" "}
								<span className="font-medium">
									{submission.reviewedBy?.name}
								</span>{" "}
								on {format(new Date(submission.reviewedAt!), "MMM dd, yyyy")}
							</p>
						</div>
						{submission.reviewComment && (
							<div className="mt-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
								<MessageSquareQuote className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
								<p className="text-sm text-amber-900">
									{submission.reviewComment}
								</p>
							</div>
						)}
					</div>
				) : (
					<div className="mt-4 border-t pt-3 text-center">
						<p className="text-xs font-medium text-gray-500">
							Waiting for review
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
