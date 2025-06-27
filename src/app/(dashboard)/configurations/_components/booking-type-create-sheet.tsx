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
import { useBookingTypesParams } from "@/hooks/use-booking-types-params";
import { BookingTypeForm } from "./booking-type-form";
import { useCreateBookingTypeMutation } from "@/hooks/use-configs";
import type { BookingFormValues } from "./booking-type-form-schema";
import { toast } from "sonner";

export function BookingTypeCreateSheet() {
	const { setParams, createBookingType } = useBookingTypesParams();
	const isOpen = Boolean(createBookingType);

	const createBookingTypeMutation = useCreateBookingTypeMutation();

	const handleSubmit = async (data: BookingFormValues) => {
		try {
			await createBookingTypeMutation.mutateAsync({
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
					<SheetTitle className="text-xl">Create Booking Type</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<BookingTypeForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
