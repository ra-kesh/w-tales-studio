import type { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/use-permissions";
import type { TaskStatusRow } from "./task-status-table-columns";

interface TaskStatusTableRowActions<TData> {
	row: Row<TaskStatusRow>;
}

export function TaskStatusTableRowActions<TData>({
	row,
}: TaskStatusTableRowActions<TData>) {
	const { canCreateAndUpdateTaskStatus } = usePermissions();

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
			<DropdownMenuContent align="end" className="w-[160px]">
				{canCreateAndUpdateTaskStatus && (
					<DropdownMenuItem
						onClick={() => {
							// @ts-ignore - we know id exists
							row.original.id && row.original.onEdit(row.original.id);
						}}
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => {
						// @ts-ignore - we know id exists
						row.original.id && row.original.onDelete(row.original.id);
					}}
				>
					<Trash className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
