"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "./task-table-column-header";
import { Badge } from "@/components/ui/badge";
import { labels, priorities, statuses } from "../data/data";
import type { Task } from "@/lib/db/schema";

export const taskColumns: ColumnDef<Task>[] = [
	// {
	//   id: "actions",
	//   cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="translate-y-[2px]"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "priority",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Priority" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>{row.getValue("priority")}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},

	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Detail" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">
						{row.getValue("description")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">
						{row.getValue("status")}
					</span>
				</div>
			);
		},
	},

	{
		accessorKey: "bookingName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Booking" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>{row.getValue("bookingName")}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "assignedTo",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Assigned" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>{row.getValue("assignedTo") ?? "N/A"}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "dueDate",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Due" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>{row.getValue("dueDate")}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
];
