"use client";

import { useBookings } from "@/hooks/use-bookings";
import React from "react";
import { useBookingColumns } from "./_components/booking-table/booking-table-columns";
import { BookingTable } from "./_components/booking-table/booking-table";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Bookings() {
	const { data } = useBookings();
	const columns = useBookingColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<ViewTransition name="experimental-label">
				<BookingTable data={data?.data || defaultData} columns={columns} />
			</ViewTransition>
		</div>
	);
}
