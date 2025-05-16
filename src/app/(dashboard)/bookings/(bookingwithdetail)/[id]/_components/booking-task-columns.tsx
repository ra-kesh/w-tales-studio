"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, TasksAssignment, Crew } from "@/lib/db/schema";
import { useTaskConfigs } from "@/hooks/use-configs";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/app/(dashboard)/tasks/_components/task-table-column-header";
import { TaskTableRowActions } from "@/app/(dashboard)/tasks/_components/task-table-row-actions";

type TaskWithRelations = Task & {
	booking: { name: string };
	tasksAssignments: Array<
		TasksAssignment & {
			crew: Crew & {
				member?: {
					user?: {
						name?: string | null;
					} | null;
				} | null;
			};
		}
	>;
};

export function useBookingTaskColumns() {
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
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Task" />
			),
			cell: ({ row }) => {
				return (
					<div className="flex w-full">
						<div className="flex flex-col space-y-1 w-full">
							<div className="font-semibold">{row.getValue("description")}</div>
							{/* <div className="flex gap-3">
								<div className="text-sm text-muted-foreground">
									{row.original.booking.name}
								</div>
							</div> */}
						</div>
					</div>
				);
			},
		},
		{
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
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},

		{
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
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
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
			accessorKey: "dueDate",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Due" />
			),
			cell: ({ row }) => {
				const dueDate = row.getValue("dueDate");
				if (!dueDate) return null;
				return (
					<div className="flex items-center">
						<span>{format(new Date(dueDate as string), "MMM dd, yyyy")}</span>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
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
