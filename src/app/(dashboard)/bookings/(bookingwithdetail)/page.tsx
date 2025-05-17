"use client";

import React from "react";
import { BookingTable } from "../_components/booking-table/booking-table";
import { unstable_ViewTransition as ViewTransition } from "react";
import { useBookingColumns } from "../_components/booking-table/booking-table-columns";
import { useBookingTable } from "@/hooks/use-booking-table";

import { BookingTableToolbar } from "../_components/booking-table/booking-table-toolbar";

export default function Bookings() {
	const columns = useBookingColumns();
	const { table } = useBookingTable(columns);

	return (
		<div className="flex-1 min-w-0 border-t">
			<BookingTableToolbar table={table} />
			<ViewTransition name="experimental-label">
				<BookingTable table={table} columns={columns} />
			</ViewTransition>
		</div>
	);
}
