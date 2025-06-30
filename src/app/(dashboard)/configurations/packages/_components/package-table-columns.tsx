"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Package } from "lucide-react";
import { PackageTableRowActions } from "./package-table-row-actions";

interface PackageType {
	id: number;
	label: string;
	metadata: {
		defaultCost: string;
		defaultDeliverables?: {
			title: string;
			quantity: string;
			is_package_included: boolean;
		}[];
	};
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export const usePackageColumns = () => {
	const columns: ColumnDef<PackageType>[] = [
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
					<div className="relative">
						<Button
							variant="outline"
							size="sm"
							className={cn(
								"gap-2  transition-colors group",
								hasDeliverables
									? "cursor-pointer"
									: "opacity-50 cursor-default",
							)}
							onClick={hasDeliverables ? () => row.toggleExpanded() : undefined}
						>
							<ChevronRight
								className={cn(
									"h-4 w-4 transition-transform duration-200",
									row.getIsExpanded() && "transform rotate-90",
								)}
							/>
							<Package className="h-4 w-4" />
							<span className="tabular-nums">
								{count} {count === 1 ? "item" : "items"}
							</span>
						</Button>
					</div>
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
