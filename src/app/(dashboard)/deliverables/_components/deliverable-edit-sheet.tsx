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
import { useDeliverable } from "@/hooks/use-deliverable";

export function DeliverableEditSheet() {
	const { setParams, deliverableId } = useDeliverableParams();
	const isOpen = Boolean(deliverableId);

	const {
		data: deliverable,
		isLoading,
		refetch,
	} = useDeliverable(deliverableId);

	const updateDeliverableMutation = useUpdateDeliverableMutation();

	const handleSubmit = async (data: DeliverableFormValues) => {
		try {
			await updateDeliverableMutation.mutate({
				data,
				deliverableId: deliverableId as string,
			});
			refetch();
			// setParams(null);
		} catch (error) {
			console.error(error);
		}
	};

	// useEffect(() => {
	// 	refetch();
	// }, [deliverableId]);

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
