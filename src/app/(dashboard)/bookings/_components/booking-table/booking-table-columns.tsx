"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking, Client, Shoot } from "@/lib/db/schema";
import { format } from "date-fns";
import { BookingTableRowActions } from "./booking-table-row-actions";

export const useBookingColumns = () => {
	const columns: ColumnDef<Booking>[] = [
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
			enableHiding: false,
			enableSorting: false,
		},
		{
			accessorKey: "name",
			header: "Booking Name",
			cell: ({ row }) => (
				<div className="w-[200px]">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "bookingType",
			header: "Type",
			cell: ({ row }) => <div>{row.getValue("bookingType")}</div>,
		},
		{
			accessorKey: "packageType",
			header: "Package",
			cell: ({ row }) => <div>{row.getValue("packageType")}</div>,
		},
		{
			accessorKey: "packageCost",
			header: "Cost",
			cell: ({ row }) => (
				<div>
					$
					{new Intl.NumberFormat().format(
						Number.parseFloat(row.getValue("packageCost")),
					)}
				</div>
			),
		},
		{
			accessorKey: "clients",
			header: "Couple",
			cell: ({ row }) => {
				const clients = row.getValue("clients") as Client;
				return (
					<div className="w-[200px]">
						{clients.brideName} & {clients.groomName}
					</div>
				);
			},
		},

		{
			accessorKey: "clientContact",
			header: "Contact",
			cell: ({ row }) => {
				const clients = row.getValue("clients") as Client;
				return (
					<div className="w-[200px]">
						{clients.email}
						<br />
						{clients.phoneNumber}
					</div>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => (
				<div>{format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}</div>
			),
		},
		{
			accessorKey: "shoots",
			header: "Shoot Details",
			cell: ({ row }) => {
				const shoots = row.getValue("shoots") as Shoot[];
				return (
					<div className="w-full">
						{shoots.map((shoot, index) => (
							<div key={shoot.id} className="mb-2 last:mb-0">
								<div className="font-medium">{shoot.title}</div>
								<div className="text-sm text-muted-foreground">
									{shoot.date
										? format(new Date(shoot.date), "MMM dd, yyyy")
										: "No date"}{" "}
									- {shoot.time}
								</div>
								<div className="text-sm text-muted-foreground">
									{shoot.location as string}
								</div>
							</div>
						))}
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <BookingTableRowActions row={row} />,
		},
	];

	return columns;
};
