"use client";

import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { ShootsTablePagination } from "./shoots-table-pagination";
import { ShootsTableToolbar } from "./shoots-table-toolbar";
import type { Shoot } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

type ShootAssignment = {
	crew: {
		name: string | null;
		role: string | null;
		member?: {
			user?: {
				name: string | null;
			};
		};
	};
	isLead?: boolean;
};

interface ShootTableProps {
	columns: ColumnDef<
		Shoot & { booking: { name: string }; shootsAssignments: ShootAssignment[] }
	>[];
	data: (Shoot & {
		booking: { name: string };
		shootsAssignments: ShootAssignment[];
	})[];
}

export function ShootsTable({ columns, data }: ShootTableProps) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [expanded, setExpanded] = React.useState({});

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			expanded,
		},
		enableRowSelection: true,
		enableExpanding: true,
		onExpandedChange: setExpanded,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="space-y-4">
			<ShootsTableToolbar table={table} />
			<div className="rounded-md border">
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
									<TableRow data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
									{row.getIsExpanded() && (
										<TableRow className="bg-muted/30">
											<TableCell className="p-0" colSpan={6} />
											<TableCell className="p-0" colSpan={2}>
												<div className="p-4">
													<div className="flex items-center justify-between mb-3">
														<h4 className="text-sm font-medium flex items-center">
															Assigned Crew Members
														</h4>
														<Badge
															variant="outline"
															className="text-xs font-normal"
														>
															{row.original.shootsAssignments.length}{" "}
															{row.original.shootsAssignments.length === 1
																? "member"
																: "members"}
														</Badge>
													</div>
													<div className="space-y-2">
														{row.original.shootsAssignments.map(
															(assignment, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between py-2 border-b last:border-0"
																>
																	<div>
																		<div className="font-medium flex items-center gap-2">
																			{assignment.crew.member?.user?.name ||
																				assignment.crew.name}
																			{assignment.isLead && (
																				<Crown className="h-4 w-4 text-primary" />
																			)}
																		</div>
																		<div className="text-sm text-muted-foreground">
																			{assignment.crew.role}
																		</div>
																	</div>
																</div>
															),
														)}
														{row.original.shootsAssignments.length === 0 && (
															<div className="text-center py-6 text-sm text-muted-foreground">
																No crew members assigned to this shoot
															</div>
														)}
													</div>
												</div>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<ShootsTablePagination table={table} />
		</div>
	);
}
