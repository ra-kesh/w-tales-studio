"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ShootTableRowActions } from "./shoots-table-row-actions";
import type { Shoot } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const useShootColumns = () => {
	const columns: ColumnDef<Shoot & { booking: { name: string } }>[] = [
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
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "booking",
			header: "Booking",
			cell: ({ row }) => (
				<div className="font-medium">{row.original.booking.name}</div>
			),
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => <div>{row.getValue("title")}</div>,
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => (
				<div>{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</div>
			),
		},
		{
			accessorKey: "time",
			header: "Time",
			cell: ({ row }) => (
				<Badge variant="outline">{row.getValue("time")}</Badge>
			),
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => (
				<div>{(row.original.location as string) ?? "N/a"}</div>
			),
		},
		{
			accessorKey: "duration",
			header: "Duration",
			cell: ({ row }) => <div>{row.getValue("duration")}</div>,
		},
		{
			id: "actions",
			cell: ({ row }) => <ShootTableRowActions row={row} />,
		},
	];

	return columns;
};
