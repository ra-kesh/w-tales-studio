"use client";

import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useShoots } from "@/hooks/use-shoots";
import { OpenShootsSheet } from "./_components/open-shoots-sheet";
import { ShootTable } from "./_components/shoots-table";
import { useShootColumns } from "./_components/shoots-table-columns";
import { ShootsTablePagination } from "./_components/shoots-table-pagination";

export default function Shoots() {
	const { data, isPending } = useShoots();

	const {
		data: minimalBookingsResponse,
		isLoading: isMininmalBookingLoading,
		isFetched: isMinimalBookingFetched,
	} = useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const columns = useShootColumns({
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
					<OpenShootsSheet />
				</DataTableToolbar>
			)}
			{isPending ? (
				<DataTableSkeleton
					columnCount={4}
					filterCount={0}
					cellWidths={["20rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
					shrinkZero
				/>
			) : (
				<ShootTable table={table} columns={columns}>
					<ShootsTablePagination table={table} />
				</ShootTable>
			)}
		</div>
	);
}
