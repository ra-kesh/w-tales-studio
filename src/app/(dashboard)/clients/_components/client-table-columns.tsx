"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientTableRowActions } from "./client-table-row-actions";
import type { Client } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";

export const useClientColumns = () => {
	const columns: ColumnDef<Client>[] = [
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
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "brideName",
			header: "Bride",
			cell: ({ row }) => <div>{row.getValue("brideName")}</div>,
		},
		{
			accessorKey: "groomName",
			header: "Groom",
			cell: ({ row }) => <div>{row.getValue("groomName")}</div>,
		},
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
