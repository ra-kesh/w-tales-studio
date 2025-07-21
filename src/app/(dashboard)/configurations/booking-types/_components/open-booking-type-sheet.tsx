"use client";

import { Button } from "@/components/ui/button";
import { useBookingTypesParams } from "@/hooks/use-booking-types-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenBookingTypeSheet() {
	const { setParams } = useBookingTypesParams();

	const { canCreateAndUpdateBookingTypes } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createBookingType: true })}
				disabled={!canCreateAndUpdateBookingTypes}
			>
				Add Booking Type
			</Button>
		</div>
	);
}
