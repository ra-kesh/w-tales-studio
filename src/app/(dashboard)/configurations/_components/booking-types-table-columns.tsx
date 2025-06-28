"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { Configuration } from "@/lib/db/schema";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { TaskTableRowActions } from "../../tasks/_components/task-table-row-actions";

interface BookingType extends Configuration {
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export function useBookingTypesColumns(): ColumnDef<BookingType>[] {
	return [
		{
			accessorKey: "value",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Value" />
			),
			cell: ({ row }) => <div>{row.getValue("value")}</div>,
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<TaskTableRowActions
					row={row}
					onEdit={() => row.original.onEdit(row.original.id)}
					onDelete={() => row.original.onDelete(row.original.id)}
				/>
			),
		},
	];
}
