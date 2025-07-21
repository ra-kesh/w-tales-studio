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
import { useCreateDeliverableMutation } from "@/hooks/use-deliverable-mutation";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { DeliverableFormValues } from "../deliverable-form-schema";
import { DeliverableForm } from "./deliverable-form";

export function DeliverableCreateSheet() {
	const { setParams, createDeliverable } = useDeliverableParams();
	const { canCreateAndUpdateDeliverable } = usePermissions();

	const isOpen = Boolean(createDeliverable) && canCreateAndUpdateDeliverable;

	const createDeliverableMutation = useCreateDeliverableMutation();

	const handleSubmit = async (data: DeliverableFormValues) => {
		try {
			await createDeliverableMutation.mutateAsync(data);
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
				<SheetHeader className=" flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Deliverable</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<DeliverableForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
