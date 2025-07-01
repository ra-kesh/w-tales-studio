"use client";

import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useConfigs } from "@/hooks/use-configs";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseTable } from "./_components/expense-table";
import { useExpenseColumns } from "./_components/expense-table-columns";
import { ExpenseTablePagination } from "./_components/expense-table-pagination";
import { OpenExpenseSheet } from "./_components/open-expense-sheet";

export default function Expenses() {
	const { data, isPending } = useExpenses();

	const {
		data: minimalBookingsResponse,
		isLoading: isMininmalBookingLoading,
		isFetched: isMinimalBookingFetched,
	} = useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const { data: categories = [] } = useConfigs("expense_category");

	const columns = useExpenseColumns({
		categoryOptions: categories,
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
					<OpenExpenseSheet />
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
				<ExpenseTable table={table} columns={columns}>
					<ExpenseTablePagination table={table} />
				</ExpenseTable>
			)}
		</div>
	);
}
