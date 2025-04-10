"use client";

import React, { Suspense } from "react";
import { getServerSession } from "@/lib/dal";
import { useBookingMutation } from "@/hooks/use-booking-mutation";
import BookingForm from "../../_components/booking-form/booking-from";
import { defaultBooking } from "../../_components/booking-form/booking-form-schema";

const EditBooking = () => {
	const { addBookingMutation } = useBookingMutation();

	return (
		<div className="flex items-center justify-center p-4 pt-0">
			<Suspense>
				<BookingForm
					defaultValues={defaultBooking}
					onSubmit={addBookingMutation.mutate}
				/>
			</Suspense>
		</div>
	);
};

export default EditBooking;
