"use client";

import React from "react";
import { BookingTable } from "../_components/booking-table/booking-table";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Bookings() {
	return (
		<div className="flex-1 min-w-0">
			<ViewTransition name="experimental-label">
				<BookingTable />
			</ViewTransition>
		</div>
	);
}
