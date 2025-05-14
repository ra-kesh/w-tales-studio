"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";

export const useBookingListColumns = () => {
	const columns: ColumnDef<Pick<Booking, "name" | "bookingType">>[] = [
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
			cell: ({ row }) => {
				const bookingName = row.getValue("name") as string;
				const type = row.original.bookingType;
				return (
					<div className="flex items-center gap-3 py-2">
						<div className="font-medium">{bookingName}</div>
						<Badge
							variant="outline"
							className="bg-primary/5 hover:bg-primary/10"
						>
							{type || "Not specified"}
						</Badge>
					</div>
				);
			},
		},
	];

	return columns;
};
