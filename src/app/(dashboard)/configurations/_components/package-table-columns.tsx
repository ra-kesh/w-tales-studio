"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Edit, Trash, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
			cell: ({ row }) => <div>₹{row.original.metadata.defaultCost}</div>,
		},
		{
			accessorKey: "bookingType",
			header: "Booking Type",
			cell: () => <div>Wedding</div>,
		},
		{
			id: "deliverables",
			header: "Deliverables",
			cell: ({ row }) => {
				return (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="sm" className="gap-2">
								<Package className="h-4 w-4" />
								<span>
									{row.original.metadata.defaultDeliverables?.length || 0} items
								</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-0" align="start">
							<div className="p-3 border-b">
								<h4 className="font-medium">Package Deliverables</h4>
								<p className="text-sm text-muted-foreground">
									Items included in {row.original.label}
								</p>
							</div>
							<ScrollArea className="h-[200px]">
								<div className="p-3 space-y-2">
									{row.original.metadata.defaultDeliverables?.map(
										(item, index) => (
											<div
												key={index}
												className="flex items-center justify-between py-2 border-b last:border-0"
											>
												<div>
													<p className="font-medium">{item.title}</p>
													{item.is_package_included && (
														<Badge variant="secondary" className="text-xs">
															Package Included
														</Badge>
													)}
												</div>
												<div className="text-sm font-medium">
													Qty: {item.quantity}
												</div>
											</div>
										),
									)}
								</div>
							</ScrollArea>
						</PopoverContent>
					</Popover>
				);
			},
		},
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex h-8 w-8 p-0 data-[state=open]:bg-muted ml-auto"
						>
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[160px]">
						<DropdownMenuItem
							onClick={() => {
								row.original.onEdit?.(row.original.id);
							}}
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								row.original.onDelete?.(row.original.id);
							}}
						>
							<Trash className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return columns;
};
