"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./task-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/db/schema";
import { useTaskConfigs } from "@/hooks/use-configs";

export function useTaskColumns() {
	const { statuses, priorities } = useTaskConfigs();

	const taskColumns: ColumnDef<Task & { booking: { name: string } }>[] = [
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
				const priority = priorities.data?.find(
					(p) => p.label === row.getValue("priority"),
				);
				return (
					<div className="flex items-center">
						<Badge variant="outline">
							{priority?.value || row.getValue("priority")}
						</Badge>
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
				const status = statuses.data?.find(
					(s) => s.label === row.getValue("status"),
				);
				return (
					<div className="flex space-x-2">
						<Badge variant={getStatusVariant(row.getValue("status"))}>
							{status?.value || row.getValue("status")}
						</Badge>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},

		{
			accessorKey: "booking",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booking" />
			),
			cell: ({ row }) => {
				return (
					<div className="flex items-center">
						<span>{row.original.booking.name}</span>
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

	return taskColumns;
}

// Helper function to determine badge variant based on status
function getStatusVariant(
	status: string,
): "default" | "outline" | "secondary" | "destructive" {
	switch (status) {
		case "done":
			return "default";
		case "in_progress":
			return "secondary";
		case "canceled":
			return "destructive";
		default:
			return "outline";
	}
}
