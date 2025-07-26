"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowUpDown,
	CalendarIcon,
	CameraIcon,
	CircleDashed,
	TextIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskConfigs } from "@/hooks/use-configs";

import type { TaskWithRelations } from "@/types/task";
import { DataTableColumnHeader } from "./task-table-column-header";
import { TaskTableRowActions } from "./task-table-row-actions";

export function useTaskColumns({
	statusOptions,
	priorityOptions,
	minimalBookings,
	minimalDeliverables,
	isMininmalBookingLoading,
	isMinimalDeliverableLoading,
}: {
	statusOptions: Array<{ label: string; value: string }>;
	priorityOptions: Array<{ label: string; value: string }>;
	minimalBookings: Array<{ id: string | number; name: string }>;
	minimalDeliverables: Array<{ id: string | number; title: string }>;
	isMininmalBookingLoading: boolean;
	isMinimalDeliverableLoading: boolean;
}) {
	const { statuses, priorities } = useTaskConfigs();

	const taskColumns: ColumnDef<TaskWithRelations>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "description",
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Task" />
			),
			cell: ({ row }) => {
				return (
					<div className="flex w-full">
						<div className="flex flex-col space-y-1 w-full">
							<div className="font-semibold">{row.getValue("description")}</div>
							<div className="flex gap-3">
								{/* <div className="text-sm text-muted-foreground">
									{row.original.booking.name}
								</div> */}
							</div>
						</div>
					</div>
				);
			},
			meta: {
				label: "Title",
				placeholder: "Filter tasks...",
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
			id: "deliverableId",
			accessorKey: "deliverable.title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Deliverable" />
			),
			cell: ({ row }) => {
				return (
					<span className="text-md whitespace-nowrap">
						{row.original.deliverable?.title || "N/a"}
					</span>
				);
			},
			// meta: {
			//   label: "Deliverable",
			//   variant: "multiSelect",
			//   options: isMinimalDeliverableLoading
			//     ? []
			//     : (minimalDeliverables.map((deliverable) => ({
			//         label: deliverable.title,
			//         value: String(deliverable.id),
			//       })) ?? []),
			//   icon: CameraIcon,
			// },
			// enableColumnFilter: true,
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "priority",
			accessorKey: "priority",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Priority" />
			),
			cell: ({ row }) => {
				const priority = priorities.data?.find(
					(p) => p.label === row.getValue("priority"),
				);
				return (
					<div className="flex items-center">
						<Badge variant="outline">
							{priority?.value || row.getValue("priority")}
						</Badge>
					</div>
				);
			},
			meta: {
				label: "Priority",
				variant: "multiSelect",
				options: priorityOptions?.map((priority) => ({
					label: priority.label,
					value: priority.value,
					// count: priorityCounts[priority],
					// icon: getPriorityIcon(priority),
				})),
				icon: ArrowUpDown,
			},
			enableColumnFilter: true,
		},

		{
			id: "status",
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = statuses.data?.find(
					(s) => s.label === row.getValue("status"),
				);
				return (
					<div className="flex space-x-2">
						<Badge variant={getStatusVariant(row.getValue("status"))}>
							{status?.value || row.getValue("status")}
						</Badge>
					</div>
				);
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

		// {
		// 	accessorKey: "booking",
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} title="Booking" />
		// 	),
		// 	cell: ({ row }) => {
		// 		return (
		// 			<div className="flex items-center">
		// 				<span>{row.original.booking.name}</span>
		// 			</div>
		// 		);
		// 	},
		// 	filterFn: (row, id, value) => {
		// 		return value.includes(row.getValue(id));
		// 	},
		// },
		{
			accessorKey: "tasksAssignments",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Crew" />
			),
			cell: ({ row }) => {
				const assignments = row.original.tasksAssignments;
				const count = assignments?.length || 0;
				const hasAssignments = count > 0;

				return (
					<div className="flex items-center gap-2">
						{hasAssignments ? (
							<>
								<div className="flex -space-x-2">
									{assignments.slice(0, 3).map((assignment) => {
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
			id: "startDate",
			accessorKey: "startDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Start Date" />
			),
			cell: ({ row }) => {
				const date = row.getValue("startDate") as string | undefined;

				if (!date) {
					return <div className="text-muted-foreground">Unscheduled</div>;
				}

				const content = format(new Date(date), "MMM dd, yyyy");

				return <div>{content}</div>;
			},
			meta: {
				label: "Start Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: "dueDate",
			accessorKey: "dueDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Due Date" />
			),
			cell: ({ row }) => {
				const date = row.getValue("dueDate") as string | undefined;

				if (!date) {
					return <div className="text-muted-foreground">Unscheduled</div>;
				}

				const content = format(new Date(date), "MMM dd, yyyy");

				return <div>{content}</div>;
			},
			meta: {
				label: "Due Date",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			id: "actions",
			cell: ({ row }) => <TaskTableRowActions row={row} />,
		},
	];

	return taskColumns;
}

// Helper function to determine badge variant based on status
function getStatusVariant(
	status: string,
): "default" | "outline" | "secondary" | "destructive" {
	switch (status) {
		case "done":
			return "default";
		case "in_progress":
			return "secondary";
		case "canceled":
			return "destructive";
		default:
			return "outline";
	}
}
