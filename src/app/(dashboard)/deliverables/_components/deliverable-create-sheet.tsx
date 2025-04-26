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
import { DeliverableFormValues } from "../deliverable-form-schema";
import { DeliverableForm } from "./deliverable-form";

export function DeliverableCreateSheet() {
  const { setParams, createDeliverable } = useDeliverableParams();
  const isOpen = Boolean(createDeliverable);

  //   const createDeliverableMutation = useCreateDeliverableMutation();

  const handleSubmit = async (data: DeliverableFormValues) => {
    try {
      console.log(data);
      // await createDeliverableMutation.mutate(data);
      setParams(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent side="right" className="min-w-xl">
        <SheetHeader className=" flex justify-between items-center flex-row">
          <SheetTitle className="text-xl">Create Deliverabales</SheetTitle>
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
