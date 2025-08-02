"use client";

import { Inbox, ListChecks, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useReviewQueueParams } from "@/hooks/use-review-queue-params";
import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionCard } from "./submission-card";

const typeFilterOptions = [
	{ id: "all", label: "All", icon: Inbox },
	{ id: "task", label: "Tasks", icon: ListChecks },
	{ id: "deliverable", label: "Deliverables", icon: Package },
];

const statusFilterOptions = [
	{ id: "ready_for_review", label: "Ready for Review" },
	{ id: "changes_requested", label: "Changes Requested" },
	{ id: "blocked", label: "Blocked" },
	{ id: "approved", label: "Approved" },
];

export default function ReviewQueuePage() {
	const {
		assignmentType,
		setAssignmentType,
		status,
		setStatus,
		assignedToMe,
		setAssignedToMe,
	} = useReviewQueueParams();

	const { data, isLoading, hasNextPage, fetchNextPage } = useSubmissions({
		assignmentType,
		status,
		assignedToMe: assignedToMe ?? false,
	});

	const submissions = data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div className="grid grid-cols-12 gap-12 py-12">
			<aside className="col-span-3 flex-shrink-0">
				<Card className="py-0">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">
								Filter Submissions
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Track and manage all the submissions
							</p>
						</div>

						<nav className="p-2 space-y-[2px]">
							{typeFilterOptions.map((option) => (
								<button
									key={option.id}
									onClick={() => setAssignmentType(option.id)}
									className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
										assignmentType === option.id
											? "bg-primary/10 text-primary"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<option.icon className="h-4 w-4" />
									{option.label}
								</button>
							))}
						</nav>
					</CardContent>
				</Card>
			</aside>

			<main className=" col-span-9 space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Review Queue</h2>
						<p className="text-muted-foreground">
							{isLoading
								? "Loading..."
								: `${data?.pages[0].pagination.total ?? 0} submission(s) found`}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							id="assigned-to-me"
							checked={assignedToMe ?? false}
							onCheckedChange={setAssignedToMe}
						/>
						<Label htmlFor="assigned-to-me">Assigned to Me</Label>
					</div>
				</div>

				{/* Status Pills */}
				<div className="flex gap-2 border-b pb-4">
					{statusFilterOptions.map((option) => (
						<Button
							key={option.id}
							variant={status === option.id ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setStatus(option.id)}
							className="rounded-full"
						>
							{option.label}
						</Button>
					))}
				</div>

				{isLoading && <div>Loading submissions...</div>}

				{!isLoading && submissions.length === 0 && (
					<EmptyState
						icon={Inbox}
						title="No Submissions Found"
						description="Try adjusting your filters to find what you're looking for."
					/>
				)}

				{submissions.length > 0 && (
					<div className="space-y-4">
						{submissions.map((submission) => (
							<SubmissionCard key={submission.id} submission={submission} />
						))}
					</div>
				)}

				{hasNextPage && (
					<div className="flex justify-center mt-6">
						<Button
							variant="outline"
							onClick={() => fetchNextPage()}
							disabled={isLoading}
						>
							Load More
						</Button>
					</div>
				)}
			</main>
		</div>
	);
}

type EmptyStateProps = {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
	return (
		<Card className="flex items-center justify-center p-12 text-center">
			<div>
				<Icon className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
				<p className="mt-1 text-sm text-gray-500">{description}</p>
			</div>
		</Card>
	);
}
