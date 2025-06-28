"use client";

import { BookingTypesTable } from "../_components/booking-types-table";

import { useBookingTypes } from "@/hooks/use-configs";
import { useBookingTypesParams } from "@/hooks/use-booking-types-params";

export default function BookingTypesConfigs() {
	const { data: bookingTypes = [] } = useBookingTypes();
	const { setParams } = useBookingTypesParams();

	const handleEdit = (id: number) => {
		setParams({ bookingTypeId: id.toString() });
	};

	const handleDelete = (id: number) => {
		console.log("Delete booking type:", id);
	};

	return (
		<div className="space-y-6">
			<BookingTypesTable
				data={bookingTypes}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
