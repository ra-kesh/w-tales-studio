"use client";

import React, { use } from "react";
import { BookingTable } from "../_components/booking-table/booking-table";
import { unstable_ViewTransition as ViewTransition } from "react";
import { useBookingColumns } from "../_components/booking-table/booking-table-columns";
import { useBookingTable } from "@/hooks/use-booking-table";

import { BookingTableToolbar } from "../_components/booking-table/booking-table-toolbar";
import { useBookings } from "@/hooks/use-bookings";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Bookings(props: {
	params: Params;
	searchParams: SearchParams;
}) {
	const columns = useBookingColumns();
	const { data, isLoading } = useBookings();

	const defaultData = React.useMemo(() => [], []);

	const { table } = useBookingTable({
		data: data?.data ?? defaultData,
		pageCount: data?.pageCount ?? 0,
		columns,
		initialState: {
			sorting: [{ id: "createdAt", desc: true }],
			columnPinning: { right: ["actions"] },
		},
		getRowId: (originalRow) => originalRow.id.toString(),
		shallow: false,
		clearOnDefault: true,
	});

	return (
		<div className="flex-1 min-w-0 border-t">
			<DataTableToolbar table={table} />
			{/* <BookingTableToolbar table={table} /> */}
			<ViewTransition name="experimental-label">
				<BookingTable table={table} columns={columns} />
			</ViewTransition>
		</div>
	);
}
