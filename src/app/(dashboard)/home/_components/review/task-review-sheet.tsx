// components/assignments/task-review-sheet.tsx
"use client";

import { X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useTaskReviewParams } from "@/hooks/use-task-review-params";
import { AssignmentUpdateForm } from "./update-assignment-form";

export function TaskReviewSheet() {
	const { reviewTaskId, setParams } = useTaskReviewParams();

	const isOpen = Boolean(reviewTaskId);

	const handleClose = () => setParams({ reviewTaskId: null });

	return (
		<Sheet open={isOpen} onOpenChange={() => handleClose()}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Update Task</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={handleClose}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				{reviewTaskId && (
					<AssignmentUpdateForm
						type="task"
						assignmentId={parseInt(reviewTaskId)}
						onSuccess={handleClose}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
