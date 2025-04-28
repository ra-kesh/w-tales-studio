"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Package,
	Edit,
	Trash,
	MoreHorizontal,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PackageTableRowActions } from "./package-table-row-actions";

interface PackageType {
	id: number;
	label: string;
	metadata: {
		defaultCost: number;
		defaultDeliverables?: {
			title: string;
			quantity: number;
			is_package_included: boolean;
		}[];
	};
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export const usePackageColumns = () => {
	const columns: ColumnDef<PackageType>[] = [
		{
			id: "expander",
			header: () => null,
			cell: ({ row }) => {
				return row.original.metadata.defaultDeliverables?.length ? (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 p-0 hover:bg-transparent"
						onClick={() => row.toggleExpanded()}
					>
						<ChevronRight
							className={cn("h-4 w-4 transition-transform duration-200", {
								"transform rotate-90": row.getIsExpanded(),
							})}
						/>
						<span className="sr-only">Toggle row expanded</span>
					</Button>
				) : null;
			},
		},
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
			accessorKey: "label",
			header: "Name",
			cell: ({ row }) => (
				<div className="font-medium flex items-center gap-2">
					{row.getValue("label")}
				</div>
			),
		},
		{
			accessorKey: "metadata.defaultCost",
			header: "Cost",
			cell: ({ row }) => (
				<div className="font-medium tabular-nums">
					₹{row.original.metadata.defaultCost.toLocaleString()}
				</div>
			),
		},
		{
			accessorKey: "bookingType",
			header: "Booking Type",
			cell: () => (
				<Badge variant="outline" className="font-normal">
					Wedding
				</Badge>
			),
		},
		{
			id: "deliverables",
			header: "Deliverables",
			cell: ({ row }) => {
				const count = row.original.metadata.defaultDeliverables?.length || 0;
				const hasDeliverables = count > 0;

				return (
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"gap-2 text-muted-foreground hover:text-foreground transition-colors",
							hasDeliverables ? "cursor-pointer" : "opacity-50 cursor-default",
						)}
						onClick={hasDeliverables ? () => row.toggleExpanded() : undefined}
					>
						<Package className="h-4 w-4" />
						<span className="tabular-nums">
							{count} {count === 1 ? "item" : "items"}
						</span>
					</Button>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <PackageTableRowActions row={row} />,
		},
	];

	return columns;
};
