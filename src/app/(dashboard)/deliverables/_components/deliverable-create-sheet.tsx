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
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { DeliverableForm } from "./deliverable-form";
import { useCreateDeliverableMutation } from "@/hooks/use-deliverable-mutation";
import type { DeliverableFormValues } from "../deliverable-form-schema";

export function DeliverableCreateSheet() {
	const { setParams, createDeliverable } = useDeliverableParams();
	const isOpen = Boolean(createDeliverable);

	const createDeliverableMutation = useCreateDeliverableMutation();

	const handleSubmit = async (data: DeliverableFormValues) => {
		try {
			await createDeliverableMutation.mutateAsync(data);
			setParams(null);
		} catch (error) {
			console.error(error);
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
