"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskStatusTableRowActions } from "./task-status-row-action";

export interface TaskStatusRow {
	id: number;
	label: string;
	value: string;
	isSystem: boolean;
	metadata: any;
	createdAt: string;
	updatedAt: string;
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export const useTaskStatusColumns = () => {
	const columns: ColumnDef<TaskStatusRow>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(v) => row.toggleSelected(!!v)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},

		{
			accessorKey: "label",
			header: "Name",
			cell: ({ row }) => row.getValue<string>("label"),
		},

		{
			accessorKey: "isSystem",
			header: "Variant",
			cell: ({ row }) => (
				<Badge
					variant={row.original.isSystem ? "secondary" : "outline"}
					className="uppercase"
				>
					{row.original.isSystem ? "System" : "Custom"}
				</Badge>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const d = new Date(row.original.createdAt);
				return <span>{format(d, "yyyy-MM-dd")}</span>;
			},
		},
		{
			accessorKey: "updatedAt",
			header: "Updated",
			cell: ({ row }) => {
				const d = new Date(row.original.updatedAt);
				return <span>{format(d, "yyyy-MM-dd")}</span>;
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <TaskStatusTableRowActions row={row} />,
		},
	];

	return columns;
};
