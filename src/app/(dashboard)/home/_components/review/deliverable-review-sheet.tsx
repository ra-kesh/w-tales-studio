// components/assignments/deliverable-review-sheet.tsx
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
import { useDeliverableReviewParams } from "@/hooks/use-deliverable-review-params";
import { AssignmentUpdateForm } from "./update-assignment-form";

export function DeliverableReviewSheet() {
	const { reviewDeliverableId, setParams } = useDeliverableReviewParams();

	const isOpen = Boolean(reviewDeliverableId);

	const handleClose = () => setParams({ reviewDeliverableId: null });

	return (
		<Sheet open={isOpen} onOpenChange={() => handleClose()}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Update Deliverable</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={handleClose}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				{reviewDeliverableId && (
					<AssignmentUpdateForm
						type="deliverable"
						assignmentId={parseInt(reviewDeliverableId)}
						onSuccess={handleClose}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
