"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Package } from "lucide-react";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingTypes } from "@/hooks/use-configs";
import { cn, formatCurrency } from "@/lib/utils";
import { PackageTableRowActions } from "./package-table-row-actions";

interface PackageType {
	id: number;
	label: string;
	value: string;
	isSystem: boolean;
	createdAt: string;
	updatedAt: string;
	metadata: {
		defaultCost: string;
		defaultDeliverables?: {
			title: string;
			quantity: string;
			is_package_included: boolean;
		}[];
		bookingType?: string;
	};
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export const usePackageColumns = () => {
	const { data: bookingTypes = [] } = useBookingTypes();

	const columns: ColumnDef<PackageType>[] = [
		// {
		// 	id: "select",
		// 	header: ({ table }) => (
		// 		<Checkbox
		// 			checked={table.getIsAllPageRowsSelected()}
		// 			onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
		// 			aria-label="Select all"
		// 		/>
		// 	),
		// 	cell: ({ row }) => (
		// 		<Checkbox
		// 			checked={row.getIsSelected()}
		// 			onCheckedChange={(value) => row.toggleSelected(!!value)}
		// 			aria-label="Select row"
		// 		/>
		// 	),
		// 	enableSorting: false,
		// 	enableHiding: false,
		// },
		{
			id: "actions",
			header: ({ table }) => <DataTableViewOptions table={table} />,
			cell: ({ row }) => <PackageTableRowActions row={row} />,
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
					{formatCurrency(row.original.metadata.defaultCost)}
				</div>
			),
		},

		{
			accessorKey: "metadata.bookingType",
			header: "Booking Type",
			cell: ({ row }) => {
				const bookingTypeValue = row.original.metadata.bookingType;
				if (!bookingTypeValue) {
					return <span>—</span>;
				}

				const bookingTypeLabel = bookingTypes.find(
					(type) => type.value === bookingTypeValue,
				)?.label;

				return (
					<Badge variant="outline">
						{bookingTypeLabel || bookingTypeValue}{" "}
					</Badge>
				);
			},
		},

		{
			accessorKey: "isSystem",
			header: "Variant",
			cell: ({ row }) => (
				<Badge
					variant={row.original.isSystem ? "secondary" : "outline"}
					className="uppercase"
				>
					{row.original.isSystem ? "System" : "Custom"}
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
	];

	return columns;
};
