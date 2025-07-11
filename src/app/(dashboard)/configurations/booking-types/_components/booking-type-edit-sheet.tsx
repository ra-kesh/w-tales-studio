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
import {
	useBookingTypeDetail,
	useUpdateBookingTypeMutation,
} from "@/hooks/use-configs";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTypeForm } from "./booking-type-form";
import type {
	BookingTypeFormValues,
	BookingTypeMetadata,
} from "./booking-type-form-schema";

export function BookingTypeEditSheet() {
	const { setParams, bookingTypeId } = useBookingTypesParams();
	const { canCreateAndUpdateBookingTypes } = usePermissions();

	const isOpen = Boolean(bookingTypeId) && canCreateAndUpdateBookingTypes;

	const { data: bookingTypeData, isLoading } = useBookingTypeDetail(
		bookingTypeId ?? "",
	);
	const updateBookingTypeMutation = useUpdateBookingTypeMutation();

	const handleSubmit = async (data: BookingTypeFormValues) => {
		try {
			await updateBookingTypeMutation.mutateAsync({
				data: {
					value: data.value,
					metadata: data.metadata,
				},
				bookingTypeId: bookingTypeId as string,
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

	const cleanedDefaultValues = React.useMemo(() => {
		if (!bookingTypeData) return undefined;
		return {
			value: bookingTypeData.value,
			metadata: (bookingTypeData.metadata as BookingTypeMetadata) || {
				roles: [],
			},
		};
	}, [bookingTypeData]);

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Booking Type</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<BookingTypeForm
						defaultValues={cleanedDefaultValues}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
