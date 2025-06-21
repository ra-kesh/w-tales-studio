"use client";

import React, { use } from "react";
import { BookingTable } from "../_components/booking-table/booking-table";
import { useBookingColumns } from "../_components/booking-table/booking-table-columns";
import { useBookingTable } from "@/hooks/use-booking-table";

import { useBookings } from "@/hooks/use-bookings";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { BookingTablePagination } from "../_components/booking-table/booking-table-pagination";

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
		<div className="flex-1 min-w-0 py-6">
			<DataTableToolbar table={table} className="my-2">
				<Link
					href={{
						pathname: "/bookings/add",
						query: { tab: "details" },
					}}
					prefetch={true}
				>
					<Button
						size="sm"
						className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
					>
						New Booking
					</Button>
				</Link>
			</DataTableToolbar>
			{isLoading ? (
				<DataTableSkeleton
					columnCount={7}
					filterCount={0}
					cellWidths={["20rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
					shrinkZero
				/>
			) : (
				<>
					<BookingTable table={table} columns={columns}>
						<BookingTablePagination table={table} />
					</BookingTable>
				</>
			)}
		</div>
	);
}
