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
import { useCreateReceivedPaymentMutation } from "@/hooks/use-payments-mutation";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";
import { ReceivedPaymentForm } from "./received-payment-form";
import type { ReceivedPaymentFormValues } from "./received-payment-form-schema";

export function ReceivedPaymentCreateSheet() {
	const { setParams, createReceivedPayment } = usePaymentsParams();
	const { canCreateAndUpdatePayment } = usePermissions();
	const isOpen = Boolean(createReceivedPayment) && canCreateAndUpdatePayment;

	const createReceivedPaymentMutation = useCreateReceivedPaymentMutation();

	const handleSubmit = async (data: ReceivedPaymentFormValues) => {
		try {
			await createReceivedPaymentMutation.mutateAsync(data);
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
					<SheetTitle className="text-xl">Create Received Payment</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<ReceivedPaymentForm onSubmit={handleSubmit} />
			</SheetContent>
		</Sheet>
	);
}
