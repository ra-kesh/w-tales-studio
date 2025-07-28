"use client";

import { format, isPast, isToday } from "date-fns";
import { AlertTriangle, CalendarIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTaskReviewParams } from "@/hooks/use-task-review-params";

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

export function TaskCard({ assignment }) {
	const { setParams } = useTaskReviewParams();
	const { task } = assignment;
	const dueDate = task.dueDate ? new Date(task.dueDate) : null;
	const isValidDate = dueDate && !isNaN(dueDate.getTime());
	const isOverdue =
		isValidDate &&
		isPast(dueDate) &&
		!isToday(dueDate) &&
		task.status !== "completed";

	const handleUpdateClick = () => {
		setParams({ reviewTaskId: assignment.id.toString() });
	};

	return (
		<li className="flex items-center justify-between gap-x-6 py-5">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<p className="text-md font-semibold text-gray-900">
						{task.description}
					</p>

					{/* Status Badge */}
					<span
						className={`
            inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset
            ${statusColors[task.status] || statusColors.pending}
          `}
					>
						{task.status.replace("_", " ")}
					</span>

					{/* Overdue Warning */}
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
					{/* Due Date */}
					{isValidDate && (
						<div className="flex items-center gap-x-1">
							<CalendarIcon className="h-4 w-4 text-gray-400" />
							<time dateTime={task.dueDate}>
								Due: {format(dueDate, "MMM dd, yyyy")}
							</time>
						</div>
					)}

					{/* Priority */}
					{task.priority && (
						<>
							{isValidDate && (
								<svg viewBox="0 0 2 2" className="size-0.5 fill-current">
									<circle r={1} cx={1} cy={1} />
								</svg>
							)}
							<span
								className={`font-medium ${priorityColors[task.priority] || priorityColors.medium}`}
							>
								{task.priority} priority
							</span>
						</>
					)}

					{/* Deliverable Link */}
				</div>

				<p className="text-xs/5 text-gray-500 mt-1">For: {task.booking.name}</p>

				{/* Notes Section - if tasks have notes */}
				{task.notes && (
					<div className="mt-2 rounded-md bg-gray-50 px-2 py-1.5">
						<p className="text-xs text-gray-600">{task.notes}</p>
					</div>
				)}
			</div>
			<div className="flex flex-none items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={handleUpdateClick}
					className="gap-2"
				>
					<Edit className="h-3 w-3" />
					Update
				</Button>
			</div>
		</li>
	);
}
