"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useRouter } from "next/navigation";
import type { Booking, Shoot } from "@/lib/db/schema";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useBookingListColumns } from "./booking-list-columns";

export function BookingList({ table, columns }) {
	const router = useRouter();

	const handleRowClick = (id: number) => {
		router.push(`/bookings/${id}`);
	};

	return (
		<div className="border-y border-l rounded-tl-md rounded-bl-md  space-y-4">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<React.Fragment key={row.id}>
								<TableRow
									data-state={row.getIsSelected() && "selected"}
									onClick={() => handleRowClick((row.original as Booking).id)}
									className="cursor-pointer hover:bg-muted/50"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							</React.Fragment>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
