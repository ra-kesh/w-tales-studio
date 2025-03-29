"use client";

import { useBookings } from "@/hooks/use-bookings";
import React from "react";
import { useBookingColumns } from "./_components/booking-table-columns";
import { BookingTable } from "./_components/booking-table";

export default function Bookings() {
	const { data, isLoading, isError } = useBookings();
	const columns = useBookingColumns();
	const defaultData = React.useMemo(() => [], []);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error loading tasks</div>;
	}

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex ">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
				</div>
			</div>
			<div className="max-w-full">
				<BookingTable data={data?.data || defaultData} columns={columns} />
			</div>
		</div>
	);
}
