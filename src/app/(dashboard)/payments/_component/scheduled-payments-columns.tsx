"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ScheduledPaymentRow } from "@/types/payments";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";

export const useScheduledPaymentsColumns = () => {
	const columns: ColumnDef<ScheduledPaymentRow>[] = [
		{
			id: "select",
			header: ({ table }) => <Checkbox /* ... */ />,
			cell: ({ row }) => <Checkbox /* ... */ />,
		},

		{
			accessorKey: "amount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Amount" />
			),
			cell: ({ row }) => formatCurrency(row.original.amount),
		},
		{
			accessorKey: "dueDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Due Date" />
			),
			cell: ({ row }) => formatDate(row.original.dueDate ?? ""),
		},
		{
			accessorKey: "booking",
			header: "Booking",
			cell: ({ row }) => row.original.booking?.name || "N/A",
			meta: {
				label: "Booking",
				variant: "multiSelect",
				icon: Book,
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Description" />
			),
			cell: ({ row }) => row.original.description ?? "N/a",
		},
		// Add actions column here if needed
	];
	return columns;
};
