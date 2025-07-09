"use client";

import React from "react";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ScheduledPaymentForm } from "./scheduled-payment-form";
import type { ScheduledPaymentFormValues } from "./scheduled-payment-form-schema";
import { useCreateScheduledPaymentMutation } from "@/hooks/use-payments-mutation";
import { toast } from "sonner";

export function ScheduledPaymentCreateSheet() {
  const { setParams, createScheduledPayment } = usePaymentsParams();
  const isOpen = Boolean(createScheduledPayment);

  const createScheduledPaymentMutation = useCreateScheduledPaymentMutation();

  const handleSubmit = async (data: ScheduledPaymentFormValues) => {
    try {
      await createScheduledPaymentMutation.mutateAsync(data);
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
          <SheetTitle className="text-xl">Create Scheduled Payment</SheetTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setParams(null)}
            className="p-0 m-0 size-auto hover:bg-transparent"
          >
            <X className="size-4" />
          </Button>
        </SheetHeader>

        <ScheduledPaymentForm onSubmit={handleSubmit} />
      </SheetContent>
    </Sheet>
  );
}
