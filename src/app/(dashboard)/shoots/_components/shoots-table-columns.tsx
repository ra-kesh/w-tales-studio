"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ShootTableRowActions } from "./shoots-table-row-actions";
import type { Shoot } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
