"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Expense } from "@/lib/db/schema";
import { ExpenseTableRowActions } from "./expense-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	FileIcon,
	DollarSign,
	Calendar,
	Tag,
	Users,
	FileText,
	TextIcon,
	CameraIcon,
	CalendarIcon,
	CircleDashed,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "../../tasks/_components/task-table-column-header";

export const useExpenseColumns = ({
	categoryOptions,
	minimalBookings,
	isMininmalBookingLoading,
}: {
	minimalBookings: Array<{ id: string | number; name: string }>;
	isMininmalBookingLoading: boolean;
}) => {
	const columns: ColumnDef<
		Expense & {
			booking: { name: string };
			expensesAssignments?: Array<{
				id: string;
				crew: {
					name: string;
					member?: { user?: { name?: string | null } | null } | null;
				};
			}>;
		}
	>[] = [
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
			id: "description",
			accessorKey: "description",
			header: "Expense",
			cell: ({ row }) => (
				<div className="flex flex-col space-y-1">
					<div className="font-medium">{row.getValue("description")}</div>
					{/* <div className="text-sm text-muted-foreground">
						{row.original.booking.name}
					</div> */}
				</div>
			),
			meta: {
				label: "Title",
				placeholder: "Filter Expenses...",
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
			id: "category",
			accessorKey: "category",
			header: () => (
				<div className="flex items-center gap-1">
					<Tag className="h-4 w-4" />
					<span>Category</span>
				</div>
			),
			cell: ({ row }) => (
				<Badge variant="outline">{row.getValue("category")}</Badge>
			),
			meta: {
				label: "Category",
				variant: "multiSelect",
				options: categoryOptions?.map((category) => ({
					label: category.label,
					value: category.value,
					// count: statusCounts[status],
					// icon: getStatusIcon(status),
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
		},
		{
			accessorKey: "amount",
			header: () => (
				<div className="flex items-center gap-1">
					<DollarSign className="h-4 w-4" />
					<span>Amount</span>
				</div>
			),
			cell: ({ row }) => (
				<div className="font-medium tabular-nums">
					${Number(row.getValue("amount")).toFixed(2)}
				</div>
			),
		},
		{
			id: "date",
			accessorKey: "date",
			header: () => (
				<div className="flex items-center gap-1">
					<Calendar className="h-4 w-4" />
					<span>Date</span>
				</div>
			),
			cell: ({ row }) => (
				<div>{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</div>
			),
			meta: {
				label: "Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: "billTo",
			header: () => (
				<div className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					<span>Bill To</span>
				</div>
			),
			cell: ({ row }) => (
				<Badge
					variant={
						row.getValue("billTo") === "Client" ? "default" : "secondary"
					}
				>
					{row.getValue("billTo")}
				</Badge>
			),
		},
		// {
		//   accessorKey: "fileUrls",
		//   header: () => (
		//     <div className="flex items-center gap-1">
		//       <FileText className="h-4 w-4" />
		//       <span>Files</span>
		//     </div>
		//   ),
		//   cell: ({ row }) => {
		//     const files = row.getValue("fileUrls") as string[];
		//     return files?.length ? (
		//       <Button variant="outline" size="sm" className="h-8 gap-2">
		//         <FileIcon className="h-4 w-4" />
		//         <span className="tabular-nums">
		//           {files.length} file{files.length !== 1 ? "s" : ""}
		//         </span>
		//       </Button>
		//     ) : (
		//       <span className="text-sm text-muted-foreground">No files</span>
		//     );
		//   },
		// },
		{
			accessorKey: "expensesAssignments",
			header: () => (
				<div className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					<span>Crew</span>
				</div>
			),
			cell: ({ row }) => {
				const assignments = row.original.expensesAssignments;
				const count = assignments?.length || 0;
				const hasAssignments = count > 0;

				return (
					<div className="flex items-center gap-2">
						{hasAssignments ? (
							<>
								<div className="flex -space-x-2">
									{assignments?.slice(0, 3).map((assignment) => {
										const name =
											assignment.crew.member?.user?.name ||
											assignment.crew.name;
										const initials = name
											?.split(" ")
											.map((n: string) => n[0])
											.join("");

										return (
											<Avatar
												key={assignment.id}
												className="h-8 w-8 border-2 border-background"
											>
												<AvatarFallback className="bg-primary/10 text-primary text-xs">
													{initials}
												</AvatarFallback>
											</Avatar>
										);
									})}
								</div>
								{count > 3 && (
									<Badge variant="secondary" className="rounded-full">
										+{count - 3}
									</Badge>
								)}
							</>
						) : (
							<span className="text-sm text-muted-foreground">
								No crew assigned
							</span>
						)}
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <ExpenseTableRowActions row={row} />,
		},
	];

	return columns;
};
