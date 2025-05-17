"use client";

import React, { useEffect } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { DeliverableForm } from "./deliverable-form";
import { useUpdateDeliverableMutation } from "@/hooks/use-deliverable-mutation";
import type { DeliverableFormValues } from "../deliverable-form-schema";
import { toast } from "sonner";
import { useDeliverable } from "@/hooks/use-deliverables";

export function DeliverableEditSheet() {
	const { setParams, deliverableId } = useDeliverableParams();
	const isOpen = Boolean(deliverableId);

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
