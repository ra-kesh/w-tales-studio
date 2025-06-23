"use client";

import { useDeliverables } from "@/hooks/use-deliverables";
import { useDeliverableColumns } from "./_components/deliverable-table-columns";
import { DeliverableTable } from "./_components/deliverable-table";
import React from "react";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { DeliverableTablePagination } from "./_components/deliverable-table-pagination";
import { OpenDeliverableSheet } from "./_components/open-deliverable-sheet";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

export default function Deliverables() {
	const { data, isLoading } = useDeliverables();

	const {
		data: minimalBookingsResponse,
		isLoading: isMininmalBookingLoading,
		isFetched: isMinimalBookingFetched,
	} = useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const columns = useDeliverableColumns({
		minimalBookings: minimalBookings ?? [],
		isMininmalBookingLoading,
	});

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
			{!isMininmalBookingLoading && isMinimalBookingFetched && (
				<DataTableToolbar table={table} className="my-2">
					<OpenDeliverableSheet />
				</DataTableToolbar>
			)}
			{isLoading ? (
				<DataTableSkeleton
					columnCount={5}
					filterCount={0}
					cellWidths={["20rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
					shrinkZero
				/>
			) : (
				<DeliverableTable table={table} columns={columns}>
					<DeliverableTablePagination table={table} />
				</DeliverableTable>
			)}
		</div>
	);
}
