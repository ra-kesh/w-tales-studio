"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ShootTableRowActions } from "./shoots-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	CalendarIcon,
	CameraIcon,
	ChevronRight,
	TextIcon,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShootRowData } from "@/types/shoots";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";

export const useShootColumns = ({
	minimalBookings,
	isMininmalBookingLoading,
}: {
	minimalBookings: Array<{ id: string | number; name: string }>;
	isMininmalBookingLoading: boolean;
}) => {
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
			id: "title",
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Shoot Title" />
			),
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.title}</div>
					<div className="text-sm text-muted-foreground">
						{row.original.booking.name}
					</div>
				</div>
			),
			meta: {
				label: "Title",
				placeholder: "Filter titles...",
				variant: "text",
				icon: TextIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},

		{
			id: "bookingId",
			accessorKey: "booking.name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booking" />
			),
			cell: ({ row }) => {
				return <span className="text-md ">{row.original.booking.name}</span>;
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
			id: "date",
			accessorKey: "date",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date" />
			),
			cell: ({ row }) => (
				<div>
					{format(new Date(row.getValue("date")), "MMM dd, yyyy")} at{" "}
					{row.original.time}{" "}
				</div>
			),
			meta: {
				label: "Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},

		// },
		{
			accessorKey: "location",
			header: "Location",
			cell: ({ row }) => (
				<div>{(row.original.location as string) ?? "N/a"}</div>
			),
		},
		{
			id: "crew",
			accessorKey: "shootsAssignments",
			header: () => (
				<div className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					<span>Crew</span>
				</div>
			),
			cell: ({ row }) => {
				const assignments = row.original.shootsAssignments;
				const count = assignments?.length || 0;
				const hasAssignments = count > 0;

				return (
					<div className="relative">
						<Button
							variant={hasAssignments ? "outline" : "ghost"}
							size="sm"
							className={cn(
								"gap-2 w-full justify-start transition-colors group",
								hasAssignments
									? "cursor-pointer hover:bg-primary/5 border-primary/20"
									: "opacity-70 cursor-default text-muted-foreground",
							)}
							onClick={hasAssignments ? () => row.toggleExpanded() : undefined}
						>
							{hasAssignments && (
								<ChevronRight
									className={cn(
										"h-4 w-4 text-primary transition-transform duration-200",
										row.getIsExpanded() && "transform rotate-90",
									)}
								/>
							)}
							<Users
								className={cn(
									"h-4 w-4",
									hasAssignments ? "text-primary" : "text-muted-foreground",
								)}
							/>
							<div className="flex flex-col items-start">
								<span className="tabular-nums font-medium">
									{count
										? `${count} crew member${count > 1 ? "s" : ""} assigned`
										: "No crew assigned"}
								</span>
							</div>
						</Button>
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <ShootTableRowActions row={row} />,
		},
	];

	return columns;
};
