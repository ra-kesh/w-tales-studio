"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Banknote, CalendarDays, CameraIcon, TextIcon } from "lucide-react"; // ADDED: Icons for new columns
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress"; // ADDED: Progress bar for financials
import type { ClientBookingRow } from "@/lib/db/queries";
import { cn, formatCurrency } from "@/lib/utils";
import type { PackageMetadata } from "../../configurations/packages/_components/package-form-schema";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";
import { ClientTableRowActions } from "./client-table-row-actions";

export const useClientColumns = ({
	packageTypes,
	isPackageTypesLoading,
	minimalBookings,
	isMininmalBookingLoading,
}: {
	packageTypes:
		| { id: number; value: string; label: string; metadata: PackageMetadata }[]
		| undefined;
	isPackageTypesLoading: boolean;
	minimalBookings: Array<{ id: string | number; name: string }>;
	isMininmalBookingLoading: boolean;
}) => {
	const columns: ColumnDef<ClientBookingRow>[] = [
		// Select column - No change
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
			id: "name",
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Client" />
			),
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.name}</div>
					<div className="text-xs text-muted-foreground">
						{row.original.email}
					</div>
				</div>
			),
			meta: {
				label: "Name",
				placeholder: "Filter Client...",
				variant: "text",
				icon: TextIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},

		{
			id: "bookingId",
			accessorKey: "bookingName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booking" />
			),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.bookingName}</span>
					<span className="text-xs text-muted-foreground">
						{packageTypes?.find((p) => p.value === row.original.packageType)
							?.label ?? row.original.packageType}
					</span>
				</div>
			),
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
		},

		{
			id: "financials",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Financials" />
			),
			cell: ({ row }) => {
				const packageCost = Number(row.original.packageCost ?? 0);
				const totalExpenses = Number(row.original.totalExpenses ?? 0);
				const totalReceived = Number(row.original.totalReceived ?? 0);

				const totalBillable = packageCost + totalExpenses;
				const balance = totalBillable - totalReceived;

				const progressPercentage =
					totalBillable > 0 ? (totalReceived / totalBillable) * 100 : 0;

				return (
					<div className="w-[250px] space-y-2">
						{/* <Progress value={progressPercentage} className="h-2" /> */}
						<div className="text-xs flex justify-between items-center">
							<span className="text-muted-foreground">Paid:</span>
							<span className="font-semibold">
								{formatCurrency(totalReceived)} /{" "}
								{formatCurrency(totalBillable)}
							</span>
						</div>
						<div className="text-xs flex justify-between items-center">
							<span className="text-muted-foreground">Balance:</span>
							<Badge
								variant="outline"
								className={cn(
									balance > 0 && "text-amber-600 border-amber-500/50",
									balance <= 0 && "text-green-600 border-green-500/50",
								)}
							>
								{formatCurrency(balance)}
							</Badge>
						</div>
					</div>
				);
			},
			meta: {
				icon: Banknote,
			},
			enableSorting: false, // Sorting on aggregated data is complex, disable for now
		},

		// --- ADDED: Booking date column ---
		{
			id: "bookingDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booked On" />
			),
			accessorFn: (row) => row.bookingCreatedAt,
			cell: ({ getValue }) => {
				const dt = getValue() as string | Date;
				return dt ? (
					<time dateTime={new Date(dt).toISOString()}>
						{format(new Date(dt), "MMM dd, yyyy")}
					</time>
				) : (
					<span className="text-muted-foreground">—</span>
				);
			},
			sortingFn: "datetime",
			meta: {
				icon: CalendarDays,
			},
		},

		{
			accessorKey: "phoneNumber",
			header: "Phone",
			cell: ({ row }) => <div>{row.getValue("phoneNumber") ?? "N/A"}</div>,
		},

		{
			id: "actions",
			header: ({ table }) => <DataTableViewOptions table={table} />,
			cell: ({ row }) => <ClientTableRowActions row={row} />,
		},
	];

	return columns;
};
