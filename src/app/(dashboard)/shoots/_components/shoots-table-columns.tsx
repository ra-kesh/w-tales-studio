"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ShootTableRowActions } from "./shoots-table-row-actions";
import type { Shoot } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type ShootRowData = Shoot & {
	booking: { name: string };
	shootsAssignments: Array<{
		crew: {
			name: string | null;
			role: string | null;
			member?: {
				user?: {
					name: string | null;
				};
			};
		};
		isLead?: boolean;
	}>;
};

export const useShootColumns = () => {
	const columns: ColumnDef<ShootRowData>[] = [
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
			accessorKey: "booking",
			header: "Booking",
			cell: ({ row }) => (
				<div className="font-medium">{row.original.booking.name}</div>
			),
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => <div>{row.getValue("title")}</div>,
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => (
				<div>{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</div>
			),
		},
		{
			accessorKey: "time",
			header: "Time",
			cell: ({ row }) => (
				<Badge variant="outline">{row.getValue("time")}</Badge>
			),
		},
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => (
				<div>{(row.original.location as string) ?? "N/a"}</div>
			),
		},
		{
			accessorKey: "shootsAssignments",
			header: "Assigned Crews",
			cell: ({ row }) => (
				<div className="space-y-1">
					{row.original.shootsAssignments.map((assignment, index) => {
						const crewName =
							assignment.crew.member?.user?.name || assignment.crew.name;
						const crewRole = assignment.crew.role;
						const isLead = assignment.isLead;

						return (
							<Badge
								key={index}
								variant={isLead ? "default" : "secondary"}
								className="mr-1"
							>
								{crewName || "Unnamed"}
								{crewRole && ` (${crewRole})`}
								{isLead && " 🎯"}
							</Badge>
						);
					})}
				</div>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => <ShootTableRowActions row={row} />,
		},
	];

	return columns;
};
