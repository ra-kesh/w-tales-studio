"use client";

import { format, isPast, isToday } from "date-fns";
import { AlertTriangle, CalendarIcon, Edit, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { useDeliverableReviewParams } from "@/hooks/use-deliverable-review-params";

const statusColors = {
	pending: "text-amber-700 bg-amber-50 ring-amber-600/20",
	in_progress: "text-blue-700 bg-blue-50 ring-blue-600/20",
	delivered: "text-green-700 bg-green-50 ring-green-600/20",
	cancelled: "text-gray-700 bg-gray-50 ring-gray-600/20",
};

export function DeliverableCard({ assignment }) {
	const { setParams } = useDeliverableReviewParams();
	const { deliverable } = assignment;
	const dueDate = deliverable.dueDate ? new Date(deliverable.dueDate) : null;
	const isValidDate = dueDate && !isNaN(dueDate.getTime());
	const isOverdue =
		isValidDate &&
		isPast(dueDate) &&
		!isToday(dueDate) &&
		deliverable.status !== "delivered";

	const handleUpdateClick = () => {
		setParams({ reviewDeliverableId: assignment.id.toString() });
	};

	return (
		<li className="flex items-center justify-between gap-x-6 py-5">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<p className="text-sm/6 font-semibold text-gray-900">
						{deliverable.title}
					</p>

					{/* Status Badge */}
					<span
						className={`
            inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap
            ${statusColors[deliverable.status] || statusColors.pending}
          `}
					>
						{deliverable.status.replace("_", " ")}
					</span>

					{/* Overdue Warning */}
					{isOverdue && (
						<span className="inline-flex items-center gap-x-1 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 whitespace-nowrap">
							<AlertTriangle className="h-3 w-3" />
							Overdue
						</span>
					)}
				</div>

				<p className="text-sm text-gray-600 mb-3">
					For: {deliverable.booking.name}
				</p>

				<div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
					{/* Due Date */}
					{isValidDate && (
						<div className="flex items-center gap-x-1">
							<CalendarIcon className="h-4 w-4 text-gray-400" />
							<time dateTime={deliverable.dueDate}>
								Due: {format(dueDate, "MMM dd, yyyy")}
							</time>
						</div>
					)}

					{/* Quantity */}
					{deliverable.quantity && (
						<>
							{isValidDate && (
								<svg viewBox="0 0 2 2" className="size-0.5 fill-current">
									<circle r={1} cx={1} cy={1} />
								</svg>
							)}
							<div className="flex items-center gap-x-1">
								<PackageIcon className="h-4 w-4 text-gray-400" />
								<span>Qty: {deliverable.quantity}</span>
							</div>
						</>
					)}
				</div>

				{/* Notes Section */}
				<div className="mt-2 rounded-md bg-gray-50 px-2 py-1.5">
					{deliverable.notes ? (
						<p className="text-xs text-gray-600">{deliverable.notes}</p>
					) : (
						<p className="text-xs text-gray-400 italic">No notes added</p>
					)}
				</div>
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
