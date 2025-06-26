"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientTableRowActions } from "./client-table-row-actions";
import { formatCurrency } from "@/lib/utils";
import type { ClientBookingRow } from "@/lib/db/queries";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { TextIcon } from "lucide-react";

export const useClientColumns = () => {
	const columns: ColumnDef<ClientBookingRow>[] = [
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
			id: "name",
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Client" />
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
			meta: {
				label: "Name",
				placeholder: "Filter Client...",
				variant: "text",
				icon: TextIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},

		// 3) Booking name
		{
			accessorKey: "bookingName",
			header: "Booking",
			cell: ({ row }) => <div>{row.getValue("bookingName")}</div>,
		},

		// 4) Package type
		{
			accessorKey: "packageType",
			header: "Package Type",
			cell: ({ row }) => (
				<div className="capitalize">{row.getValue("packageType")}</div>
			),
		},

		{
			accessorKey: "packageCost",
			header: "Cost",
			cell: ({ row }) => {
				const cost = row.getValue("packageCost");
				return <div>{formatCurrency(cost as string)}</div>;
			},
		},

		// 6) Booking date (optional)
		// {
		// 	id: "bookingDate",
		// 	header: "Booked On",
		// 	accessorFn: (row) => row.bookingCreatedAt,
		// 	cell: ({ getValue }) => {
		// 		const dt = getValue() as string | Date;
		// 		return dt ? (
		// 			<time dateTime={new Date(dt).toISOString()}>
		// 				{format(new Date(dt), "MMM d, yyyy")}
		// 			</time>
		// 		) : (
		// 			"—"
		// 		);
		// 	},
		// },
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => <div>{row.getValue("email")}</div>,
		},
		{
			accessorKey: "phoneNumber",
			header: "Phone",
			cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
		},
		{
			accessorKey: "address",
			header: "Address",
			cell: ({ row }) => <div>{row.getValue("address")}</div>,
		},
		{
			id: "actions",
			cell: ({ row }) => <ClientTableRowActions row={row} />,
		},
	];

	return columns;
};
