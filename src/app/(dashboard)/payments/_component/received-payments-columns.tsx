"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReceivedPaymentRow } from "@/types/payments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Book } from "lucide-react";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";

export const useReceivedPaymentsColumns = () => {
	const columns: ColumnDef<ReceivedPaymentRow>[] = [
		{
			id: "select",
			header: ({ table }) => <Checkbox /* ... */ />,
			cell: ({ row }) => <Checkbox /* ... */ />,
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Description" />
			),
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
			cell: ({ row }) => formatDate(row.original.paidOn),
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
		// Add actions column here if needed
	];
	return columns;
};
