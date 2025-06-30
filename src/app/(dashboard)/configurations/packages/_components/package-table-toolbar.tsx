"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OpenPackageSheet } from "../../_components/open-package-sheet";

interface PackageTableToolbarProps<TData> {
	table: Table<TData>;
}

export function PackageTableToolbar<TData>({
	table,
}: PackageTableToolbarProps<TData>) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter packages..."
					value={(table.getColumn("label")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("label")?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{table.getState().columnFilters.length > 0 && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<OpenPackageSheet />
		</div>
	);
}
