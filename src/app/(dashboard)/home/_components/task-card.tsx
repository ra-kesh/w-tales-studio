"use client";

import { format, isPast, isToday } from "date-fns";
import {
	AlertTriangle,
	CalendarIcon,
	ChevronDown,
	Edit,
	Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAssignmentSubmissions } from "@/hooks/use-assignments";
import { useTaskReviewParams } from "@/hooks/use-task-review-params";
import type { TaskAssignmentWithRelations } from "@/types/task";
import { SubmissionHistoryItem } from "./submission-history";
import {
	type WorkflowStatus,
	WorkflowStatusBadge,
} from "./workflow-status-badge";

const statusColors = {
	pending: "text-amber-700 bg-amber-50 ring-amber-600/20",
	in_progress: "text-blue-700 bg-blue-50 ring-blue-600/20",
	completed: "text-green-700 bg-green-50 ring-green-600/20",
	cancelled: "text-gray-700 bg-gray-50 ring-gray-600/20",
};

const priorityColors = {
	low: "text-gray-600",
	medium: "text-amber-600",
	high: "text-red-600",
};

export function TaskCard({
	assignment,
}: {
	assignment: TaskAssignmentWithRelations;
}) {
	const { setParams } = useTaskReviewParams();
	const { task } = assignment;

	console.log({ task });

	const [isExpanded, setIsExpanded] = useState(false);

	const {
		data: submissions,
		isLoading,
		refetch,
	} = useAssignmentSubmissions("task", task.id);

	const handleToggleFeedback = () => {
		if (!isExpanded && !submissions) {
			refetch();
		}
		setIsExpanded(!isExpanded);
	};

	const dueDate = task.dueDate ? new Date(task.dueDate) : null;
	const isValidDate = dueDate && !isNaN(dueDate.getTime());
	const isOverdue =
		isValidDate &&
		isPast(dueDate) &&
		!isToday(dueDate) &&
		task.status !== "completed";

	const handleUpdateClick = () => {
		setParams({ reviewTaskId: task.id.toString() });
	};

	return (
		<li className="flex flex-col w-full  py-5">
			<div className="flex items-center justify-between gap-x-6">
				<div className="flex flex-col">
					<div className="flex items-center gap-x-3">
						<p className="text-md font-semibold text-gray-900">
							{task.description}
						</p>
						{/* Status Badge */}
						{!task.workflowStatus ? (
							<span
								className={`
            inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset
           ${statusColors[task.status as keyof typeof statusColors] || statusColors.pending}
          `}
							>
								{task.status.replace("_", " ")}
							</span>
						) : (
							<WorkflowStatusBadge
								status={task.workflowStatus as WorkflowStatus}
							/>
						)}

						{isOverdue && (
							<span className="inline-flex items-center gap-x-1 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
								<AlertTriangle className="h-3 w-3" />
								Overdue
							</span>
						)}
					</div>

					{task.deliverable && (
						<>
							<div className="flex items-center gap-x-1">
								<span className="text-sm">{task.deliverable.title}</span>
							</div>
						</>
					)}

					<div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
						{isValidDate && (
							<div className="flex items-center gap-x-1">
								<CalendarIcon className="h-4 w-4 text-gray-400" />
								<time dateTime={task.dueDate ?? undefined}>
									Due: {format(dueDate, "MMM dd, yyyy")}
								</time>
							</div>
						)}

						{task.priority && (
							<>
								{isValidDate && (
									<svg viewBox="0 0 2 2" className="size-0.5 fill-current">
										<circle r={1} cx={1} cy={1} />
									</svg>
								)}
								<span
									className={`font-medium ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}`}
								>
									{task.priority} priority
								</span>
							</>
						)}
					</div>

					<p className="text-xs/5 text-gray-500 mt-1">
						For: {task.booking.name}
					</p>
				</div>
				<div className="flex items-center space-x-3">
					{task.workflowStatus !== "approved" && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleUpdateClick}
							className="gap-2"
						>
							<Edit className="h-3 w-3" />
							Update
						</Button>
					)}

					{task.workflowStatus && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleToggleFeedback}
							className="h-auto p-1 text-xs text-gray-500 hover:bg-gray-200"
						>
							View Feedback <ChevronDown className="ml-1 h-3 w-3" />
						</Button>
					)}
				</div>
			</div>
			{task.workflowStatus && (
				<div className="mt-3 w-full">
					{isExpanded && (
						<div className="mt-2 border-t pt-2">
							{isLoading && (
								<div className="flex items-center gap-2 text-sm text-gray-500 p-4">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading history...
								</div>
							)}
							{submissions && (
								<div className="space-y-2">
									{submissions.map((sub: any) => (
										<SubmissionHistoryItem key={sub.id} submission={sub} />
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</li>
	);
}
