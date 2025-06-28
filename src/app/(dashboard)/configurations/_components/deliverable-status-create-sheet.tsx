"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";
import { DeliverableStatusForm } from "./deliverable-status-form";
import { useCreateDeliverableStatusMutation } from "@/hooks/use-configs";
import type { DeliverableStatusFormValues } from "./deliverable-status-form-schema";
import { toast } from "sonner";

export function DeliverableStatusCreateSheet() {
	const { setParams, createDeliverableStatus } = useDeliverableStatusParams();
	const isOpen = Boolean(createDeliverableStatus);

	const createDeliverableStatusMutation = useCreateDeliverableStatusMutation();

	const handleSubmit = async (data: DeliverableStatusFormValues) => {
		try {
			await createDeliverableStatusMutation.mutateAsync({
				value: data.value,
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
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Deliverable Status</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<DeliverableStatusForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
