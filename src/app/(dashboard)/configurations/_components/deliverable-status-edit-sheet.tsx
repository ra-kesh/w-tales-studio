"use client";

import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	useDeliverableStatusDetail,
	useUpdateDeliverableStatusMutation,
} from "@/hooks/use-configs";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";
import { usePermissions } from "@/hooks/use-permissions";
import { DeliverableStatusForm } from "./deliverable-status-form";
import type { DeliverableStatusFormValues } from "./deliverable-status-form-schema";

export function DeliverableStatusEditSheet() {
	const { setParams, deliverableStatusId } = useDeliverableStatusParams();
	const { canCreateAndUpdateDeliverableStatus } = usePermissions();

	const isOpen =
		Boolean(deliverableStatusId) && canCreateAndUpdateDeliverableStatus;

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
