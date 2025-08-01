// components/assignments/workflow-status-badge.tsx
"use client";

export type WorkflowStatus =
	| "ready_for_review"
	| "revision_needed"
	| "approved";

const statusProps: Record<WorkflowStatus, { text: string; className: string }> =
	{
		ready_for_review: {
			text: "Ready for Review",
			className: "bg-blue-100 text-blue-800",
		},
		revision_needed: {
			text: "Revision Needed",
			className: "bg-amber-100 text-amber-800",
		},
		approved: {
			text: "Approved",
			className: "bg-green-100 text-green-800",
		},
	};

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
	const current = statusProps[status];
	if (!current) return null;

	return (
		<span
			className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${current.className}`}
		>
			{current.text}
		</span>
	);
}
