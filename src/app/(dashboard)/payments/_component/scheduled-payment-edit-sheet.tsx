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
import { useScheduledPaymentDetail } from "@/hooks/use-payments";
import { useUpdateScheduledPaymentMutation } from "@/hooks/use-payments-mutation";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { ScheduledPaymentForm } from "./scheduled-payment-form";
import type { ScheduledPaymentFormValues } from "./scheduled-payment-form-schema";

export function ScheduledPaymentEditSheet() {
	const { setParams, scheduledPaymentId } = usePaymentsParams();
	const updateScheduledPaymentMutation = useUpdateScheduledPaymentMutation();

	const {
		data: scheduledPayment,
		refetch,
		isLoading,
	} = useScheduledPaymentDetail(scheduledPaymentId as string);

	const isOpen = Boolean(scheduledPaymentId);

	const handleSubmit = async (data: ScheduledPaymentFormValues) => {
		try {
			await updateScheduledPaymentMutation.mutateAsync({
				data,
				scheduledPaymentId: scheduledPaymentId as string,
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
					<SheetTitle className="text-xl">Edit Scheduled Payment</SheetTitle>
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
					scheduledPayment && (
						<ScheduledPaymentForm
							defaultValues={scheduledPayment}
							onSubmit={handleSubmit}
							mode="edit"
						/>
					)
				)}
			</SheetContent>
		</Sheet>
	);
}
