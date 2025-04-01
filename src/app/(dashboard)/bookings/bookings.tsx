"use client";

import { useBookings } from "@/hooks/use-bookings";
import React from "react";
import { useBookingColumns } from "./_components/booking-table-columns";
import { BookingTable } from "./_components/booking-table";

export default function Bookings() {
	const { data } = useBookings();
	const columns = useBookingColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<BookingTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
