"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateDeliverableMutation } from "@/hooks/use-deliverable-mutation";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { useDeliverable } from "@/hooks/use-deliverables";
import { usePermissions } from "@/hooks/use-permissions";
import type { DeliverableFormValues } from "../deliverable-form-schema";
import { DeliverableForm } from "./deliverable-form";

export function DeliverableEditSheet() {
	const { setParams, deliverableId } = useDeliverableParams();
	const { canCreateAndUpdateDeliverable } = usePermissions();

	const isOpen = Boolean(deliverableId) && canCreateAndUpdateDeliverable;

	const { data: deliverable, isLoading } = useDeliverable(deliverableId);

	const updateDeliverableMutation = useUpdateDeliverableMutation();

	const handleSubmit = async (data: DeliverableFormValues) => {
		try {
			await updateDeliverableMutation.mutateAsync({
				data,
				deliverableId: deliverableId as string,
			});
			setParams(null);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Deliverable</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<DeliverableForm
						defaultValues={deliverable?.data}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
