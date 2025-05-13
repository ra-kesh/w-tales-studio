"use client";

import * as React from "react";
import {
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
} from "@tanstack/react-table";
import type { Booking, Shoot } from "@/lib/db/schema";
import { useBookings } from "./use-bookings";

export function useBookingTable(columns: ColumnDef<Booking>[]) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [expanded, setExpanded] = React.useState({});

	const { data, isLoading } = useBookings();

	const defaultData = React.useMemo(() => [], []);

	const table = useReactTable({
		data: Array.isArray(data?.data)
			? data.data
			: data?.data
				? [data.data]
				: defaultData,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return {
		table,
		isLoading,
		rowSelection,
		columnVisibility,
		columnFilters,
		sorting,
		expanded,
	};
}
