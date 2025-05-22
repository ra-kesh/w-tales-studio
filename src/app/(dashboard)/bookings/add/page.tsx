"use client";

import React, { Suspense } from "react";
import Bookingform from "../_components/booking-form/booking-from";
import { defaultBooking } from "../_components/booking-form/booking-form-schema";
import { useBookingMutation } from "@/hooks/use-booking-mutation";

const NewBooking = () => {
	const { addBookingMutation } = useBookingMutation();

	return (
		<div className="flex items-center justify-center p-4 pt-0">
			<Suspense>
				<Bookingform
					defaultValues={defaultBooking}
					onSubmit={addBookingMutation.mutateAsync}
					isPending={addBookingMutation.isPending}
				/>
			</Suspense>
		</div>
	);
};

export default NewBooking;
