"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReceivedPaymentRow } from "@/types/payments";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { ReceivedPaymentsRowActions } from "./received-payments-row-action";

export const useReceivedPaymentsColumns = () => {
	const columns: ColumnDef<ReceivedPaymentRow>[] = [
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
			accessorKey: "paidOn",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date Paid" />
			),
			cell: ({ row }) => formatDate(row.original.paidOn ?? ""),
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
		{
			id: "actions",
			cell: ({ row }) => <ReceivedPaymentsRowActions row={row} />,
		},
		// Add actions column here if needed
	];
	return columns;
};
