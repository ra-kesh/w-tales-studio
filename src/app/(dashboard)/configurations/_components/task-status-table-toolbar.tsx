"use client";

import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { OpenTaskStatusSheet } from "./open-task-status-sheet";

interface TaskStatusTableToolbarProps<TData> {
	table: Table<TData>;
}

export function TaskStatusTableToolbar<TData>({
	table,
}: TaskStatusTableToolbarProps<TData>) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter task status..."
					value={(table.getColumn("label")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("label")?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
			</div>
			<OpenTaskStatusSheet />
		</div>
	);
}
