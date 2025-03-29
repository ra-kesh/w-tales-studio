"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { BookingTableRowActions } from "./booking-table-row-actions";
import type { Booking } from "@/lib/db/schema";

export const useBookingColumns = () => {
	const columns: ColumnDef<Booking>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableHiding: false,
			enableSorting: false,
		},
		{
			accessorKey: "name",
			header: "Booking ",
			cell: ({ row }) => (
				<div className="w-[200px]">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "client",
			header: "Client",
			cell: ({ row }) => <div>{row.getValue("client")}</div>,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <div>{row.getValue("status")}</div>,
		},
		{
			accessorKey: "startDate",
			header: "Start Date",
			cell: ({ row }) => <div>{row.getValue("startDate")}</div>,
		},
		{
			accessorKey: "endDate",
			header: "End Date",
			cell: ({ row }) => <div>{row.getValue("endDate")}</div>,
		},
		{
			id: "actions",
			cell: ({ row }) => <BookingTableRowActions row={row} />,
		},
	];

	return columns;
};
