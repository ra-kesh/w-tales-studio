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
import { useBookingTypesParams } from "@/hooks/use-booking-types-params";
import { useCreateBookingTypeMutation } from "@/hooks/use-configs";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTypeForm } from "./booking-type-form";
import type { BookingTypeFormValues } from "./booking-type-form-schema";

export function BookingTypeCreateSheet() {
	const { setParams, createBookingType } = useBookingTypesParams();
	const { canCreateAndUpdateBookingTypes } = usePermissions();

	const isOpen = Boolean(createBookingType) && canCreateAndUpdateBookingTypes;

	const createBookingTypeMutation = useCreateBookingTypeMutation();

	const handleSubmit = async (data: BookingTypeFormValues) => {
		try {
			await createBookingTypeMutation.mutateAsync({
				value: data.value,
				metadata: data.metadata,
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
