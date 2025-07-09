"use client";

import { XIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useReceivedPaymentDetail } from "@/hooks/use-payments";
import { useUpdateReceivedPaymentMutation } from "@/hooks/use-payments-mutation";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { ReceivedPaymentForm } from "./received-payment-form";
import type { ReceivedPaymentFormValues } from "./received-payment-form-schema";

export function ReceivedPaymentEditSheet() {
	const { setParams, receivedPaymentId } = usePaymentsParams();
	const updateReceivedPaymentMutation = useUpdateReceivedPaymentMutation();

	const {
		data: receivedPayment,
		refetch,
		isLoading,
	} = useReceivedPaymentDetail(receivedPaymentId as string);

	const isOpen = Boolean(receivedPaymentId);

	const handleSubmit = async (data: ReceivedPaymentFormValues) => {
		try {
			await updateReceivedPaymentMutation.mutateAsync({
				data,
				receivedPaymentId: receivedPaymentId as string,
			});
			refetch();
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
					<SheetTitle className="text-xl">Edit Received Payment</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<XIcon className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading..</div>
				) : (
					receivedPayment && (
						<ReceivedPaymentForm
							defaultValues={receivedPayment}
							onSubmit={handleSubmit}
							mode="edit"
						/>
					)
				)}
			</SheetContent>
		</Sheet>
	);
}
