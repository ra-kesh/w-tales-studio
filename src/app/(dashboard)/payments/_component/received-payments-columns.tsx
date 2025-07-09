"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Book, CalendarIcon, CameraIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReceivedPaymentRow } from "@/types/payments";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { ReceivedPaymentsRowActions } from "./received-payments-row-action";

export const useReceivedPaymentsColumns = ({
	minimalBookings,
	isMininmalBookingLoading,
}: {
	minimalBookings: Array<{ id: string | number; name: string }>;
	isMininmalBookingLoading: boolean;
}) => {
	const columns: ColumnDef<ReceivedPaymentRow>[] = [
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
			id: "bookingId",
			accessorKey: "booking.name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booking" />
			),
			cell: ({ row }) => {
				return <span className="text-md ">{row.original.booking?.name}</span>;
			},
			meta: {
				label: "Boooking",
				variant: "multiSelect",
				options: isMininmalBookingLoading
					? []
					: (minimalBookings.map((booking) => ({
							label: booking.name,
							value: String(booking.id),
						})) ?? []),
				icon: CameraIcon,
			},
			enableColumnFilter: true,
			enableSorting: false,
			enableHiding: false,
		},

		{
			accessorKey: "amount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Amount" />
			),
			cell: ({ row }) => formatCurrency(row.original.amount),
		},
		{
			id: "paidOn",
			accessorKey: "paidOn",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Received On" />
			),
			cell: ({ row }) => formatDate(row.original.paidOn ?? ""),
			meta: {
				label: "Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
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
	];
	return columns;
};
