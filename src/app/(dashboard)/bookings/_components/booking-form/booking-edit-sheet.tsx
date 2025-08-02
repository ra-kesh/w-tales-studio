"use client";

import { XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateBookingMutation } from "@/hooks/use-booking-mutation";
import { useBookingParams } from "@/hooks/use-booking-params";
import { useBookingFormData } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingEditForm } from "./booking-edit-form";
import type { BookingEditFormValues } from "./booking-edit-form-schema";

export function BookingEditSheet() {
	const { setParams, updateBookingId } = useBookingParams();

	const { canCreateAndUpdateBooking } = usePermissions();

	const isOpen = Boolean(updateBookingId) && canCreateAndUpdateBooking;

	const {
		data: booking,
		refetch,
		isLoading,
	} = useBookingFormData(updateBookingId as string);

	const updateMutation = useUpdateBookingMutation();

	const handleSubmit = async (data: BookingEditFormValues) => {
		await updateMutation.mutateAsync({ id: updateBookingId as string, data });
		refetch();
		setParams(null);
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Booking Detail</SheetTitle>
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
					<div>Loading...</div>
				) : booking ? (
					<BookingEditForm booking={booking} onSubmit={handleSubmit} />
				) : (
					<div>Booking not found.</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
