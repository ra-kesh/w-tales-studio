"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Text } from "lucide-react";
import { DataTableColumnHeader } from "@/app/(dashboard)/tasks/_components/task-table-column-header";

export const useBookingListColumns = () => {
	const columns: ColumnDef<Pick<Booking, "id" | "name" | "bookingType">>[] = [
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
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => {
				const bookingName = row.getValue("name") as string;
				const type = row.original.bookingType;
				return (
					<div className="flex items-center gap-3 py-2">
						{/* <Badge
							variant="outline"
							// className="bg-primary/5 hover:bg-primary/10"
						>
							{type || "Not specified"}
						</Badge> */}
						<div className="font-medium">{bookingName}</div>
					</div>
				);
			},
			meta: {
				label: "Name",
				placeholder: "Search names...",
				variant: "text",
				icon: Text,
			},
			enableColumnFilter: true,
			enableSorting: false,
			enableHiding: false,
		},
	];

	return columns;
};
