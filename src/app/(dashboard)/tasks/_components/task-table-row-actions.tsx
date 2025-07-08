"use client";

import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/use-permissions";
import { useTaskParams } from "@/hooks/use-task-params";
import type { Crew, Task, TasksAssignment } from "@/lib/db/schema";

interface DataTableRowActionsProps<TData> {
	row: Row<
		Task & {
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
		}
	>;
}

export function TaskTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const task = row.original;
	const { setParams } = useTaskParams();

	const { canCreateAndUpdateTask } = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				{canCreateAndUpdateTask && (
					<DropdownMenuItem
						onClick={() => setParams({ taskId: task.id.toString() })}
					>
						Edit task
					</DropdownMenuItem>
				)}

				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete
					<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
