"use client";

import type { Table } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OpenPackageSheet } from "./open-package-sheet";

interface BookingTypesTableToolbarProps<TData> {
	table: Table<TData>;
}

export function BookingTypesTableToolbar<TData>({
	table,
}: BookingTypesTableToolbarProps<TData>) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter booking types..."
					value={(table.getColumn("value")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("value")?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
			</div>
			<OpenPackageSheet />
			{/* <Button size="sm" className="h-8 lg:flex">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Booking Type
      </Button> */}
		</div>
	);
}
