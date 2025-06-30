"use client";

import { Button } from "@/components/ui/button";
import { useBookingTypesParams } from "@/hooks/use-booking-types-params";

export function OpenBookingTypeSheet() {
	const { setParams } = useBookingTypesParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createBookingType: true })}
			>
				Add Booking Type
			</Button>
		</div>
	);
}
