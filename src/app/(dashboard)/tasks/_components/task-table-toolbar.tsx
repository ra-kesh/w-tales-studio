"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./task-table-faceted-filter";
import { useTaskConfigs } from "@/hooks/use-configs";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
}

export function TaskTableToolbar<TData>({
	table,
}: DataTableToolbarProps<TData>) {
	const { statuses, priorities, isLoading } = useTaskConfigs();
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter tasks..."
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn("description")?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{table.getColumn("status") && statuses.data && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={statuses.data}
					/>
				)}
				{table.getColumn("priority") && priorities.data && (
					<DataTableFacetedFilter
						column={table.getColumn("priority")}
						title="Priority"
						options={priorities.data}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<X />
					</Button>
				)}
			</div>
			<div>
				<Button>Add task</Button>
			</div>
		</div>
	);
}
