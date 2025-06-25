"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DeliverableTableRowActions } from "./deliverable-table-row-actions";
import type { DeliverableRowData } from "@/types/deliverables";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	CalendarIcon,
	CameraIcon,
	ChevronRight,
	CircleDashed,
	Package2,
	TextIcon,
	Users,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { deliverables, Task, tasks } from "@/lib/db/schema";

export const useDeliverableColumns = ({
	statusOptions,
	minimalBookings,
	isMininmalBookingLoading,
}: {
	statusOptions: Array<{ label: string; value: string }>;
	minimalBookings: Array<{ id: string | number; name: string }>;
	isMininmalBookingLoading: boolean;
}) => {
	const columns: ColumnDef<DeliverableRowData>[] = [
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
			header: "Deliverable",
			cell: ({ row }) => (
				<div className="flex w-full">
					<div className="flex space-x-2 w-full">
						<div className="font-semibold">{row.getValue("title")}</div>
						<Badge
							variant={row.original.isPackageIncluded ? "outline" : "default"}
						>
							{row.original.isPackageIncluded
								? "Included"
								: formatCurrency(Number(row.original.cost))}
						</Badge>
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
			accessorKey: "quantity",
			header: "Quantity",
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					<span className="tabular-nums font-medium">
						{row.getValue("quantity")}
					</span>
					<span className="text-xs text-muted-foreground">units</span>
				</div>
			),
		},
		// {
		// 	id: "cost",
		// 	header: () => (
		// 		<div className="flex items-center gap-1">
		// 			<Package2 className="h-4 w-4" />
		// 			<span>Extra cost</span>
		// 		</div>
		// 	),
		// 	cell: ({ row }) => (
		// 		<div className="flex items-center gap-3">
		// 			{!row.original.isPackageIncluded && row.original.cost ? (
		// 				<span className="tabular-nums text-sm">
		// 					${Number(row.original.cost).toLocaleString()}
		// 				</span>
		// 			) : (
		// 				<span className=" text-sm">N/a</span>
		// 			)}
		// 		</div>
		// 	),
		// },
		{
			id: "status",
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				const variant =
					status === "completed"
						? "default"
						: status === "in_progress"
							? "secondary"
							: status === "cancelled"
								? "destructive"
								: "outline";

				return <Badge variant={variant}>{status?.replace("_", " ")}</Badge>;
			},
			meta: {
				label: "Status",
				variant: "multiSelect",
				options: statusOptions?.map((status) => ({
					label: status.label,
					value: status.value,
					// count: statusCounts[status],
					// icon: getStatusIcon(status),
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
		},

		{
			id: "dueDate",
			accessorKey: "dueDate",
			header: () => (
				<div className="flex items-center gap-1">
					<Calendar className="h-4 w-4" />
					<span>Due Date</span>
				</div>
			),
			cell: ({ row }) => (
				<div>{format(new Date(row.getValue("dueDate")), "MMM dd, yyyy")}</div>
			),
			meta: {
				label: "Due Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: "deliverablesAssignments",
			header: () => (
				<div className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					<span>Crew</span>
				</div>
			),
			cell: ({ row }) => {
				const assignments = row.original.deliverablesAssignments;
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
			cell: ({ row }) => <DeliverableTableRowActions row={row} />,
		},
	];

	return columns;
};
