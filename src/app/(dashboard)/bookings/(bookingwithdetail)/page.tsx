"use client";

import { da } from "date-fns/locale";
import React from "react";
import NewBookingButton from "@/components/button/new-booking";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useBookings } from "@/hooks/use-bookings";
import { usePackageTypes } from "@/hooks/use-configs";
import { BookingTable } from "../_components/booking-table/booking-table";
import { useBookingColumns } from "../_components/booking-table/booking-table-columns";
import { BookingTablePagination } from "../_components/booking-table/booking-table-pagination";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Bookings(props: {
	params: Params;
	searchParams: SearchParams;
}) {
	const { data, isPending } = useBookings();

	const { data: packageTypes, isPending: isPackageTypesLoading } =
		usePackageTypes();

	const columns = useBookingColumns({ packageTypes, isPackageTypesLoading });

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
				<NewBookingButton />
			</DataTableToolbar>
			{isPending ? (
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
