"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { participantRoles } from "@/data/role-data";
import type { BookingTypeMetadata } from "./booking-type-form-schema";
import { BookingTypeTableRowActions } from "./booking-type-row-action";

export interface BookingTypeRow {
	id: number;
	label: string;
	value: string;
	isSystem: boolean;
	metadata: BookingTypeMetadata;
	createdAt: string;
	updatedAt: string;
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export const useBookingTypeColumns = () => {
	const columns: ColumnDef<BookingTypeRow>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(v) => row.toggleSelected(!!v)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},

		{
			accessorKey: "label",
			header: "Name",
			cell: ({ row }) => row.getValue<string>("label"),
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
			accessorKey: "metadata",
			header: "Roles",
			cell: ({ row }) => {
				const roleValues = row.original.metadata?.roles;

				if (!roleValues || roleValues.length === 0) {
					return <span>—</span>;
				}

				const displayRoles = roleValues
					.map((val) => participantRoles.find((p) => p.value === val)?.label)
					.filter(Boolean);

				return (
					<div className="flex flex-wrap gap-1">
						{displayRoles.map((label) => (
							<Badge key={label} variant="secondary">
								{label}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const d = new Date(row.original.createdAt);
				return <span>{format(d, "yyyy-MM-dd")}</span>;
			},
		},
		{
			accessorKey: "updatedAt",
			header: "Last Updated",
			cell: ({ row }) => {
				const dateToDisplay = new Date(
					row.original.updatedAt || row.original.createdAt,
				);

				return (
					<span>{formatDistanceToNow(dateToDisplay, { addSuffix: true })}</span>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <BookingTypeTableRowActions row={row} />,
		},
	];

	return columns;
};
