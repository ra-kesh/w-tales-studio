"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";
import { DeliverableStatusForm } from "./deliverable-status-form";
import {
	useDeliverableStatusDetail,
	useUpdateDeliverableStatusMutation,
} from "@/hooks/use-configs";
import type { DeliverableStatusFormValues } from "./deliverable-status-form-schema";
import { toast } from "sonner";

export function DeliverableStatusEditSheet() {
	const { setParams, deliverableStatusId } = useDeliverableStatusParams();
	const isOpen = Boolean(deliverableStatusId);

	const { data: deliverableStatusData, isLoading } = useDeliverableStatusDetail(
		deliverableStatusId ?? "",
	);
	const updateDeliverableStatusMutation = useUpdateDeliverableStatusMutation();

	const handleSubmit = async (data: DeliverableStatusFormValues) => {
		try {
			await updateDeliverableStatusMutation.mutateAsync({
				data: {
					value: data.value,
				},
				deliverableStatusId: deliverableStatusId as string,
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

	const cleanedDefaultValues = deliverableStatusData
		? {
				key: deliverableStatusData.key,
				value: deliverableStatusData.value,
			}
		: undefined;

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Deliverable Status</SheetTitle>
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
					<DeliverableStatusForm
						defaultValues={cleanedDefaultValues}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
