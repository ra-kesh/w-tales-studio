"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePackageColumns } from "./package-table-columns";
import { PackageTableToolbar } from "./package-table-toolbar";
import { PackageTablePagination } from "./package-table-pagination";

interface PackageType {
	id: number;
	label: string;
	metadata: {
		defaultCost: number;
		defaultDeliverables?: {
			title: string;
			quantity: number;
			is_package_included: boolean;
		}[];
	};
}

interface PackageTableProps {
	data: PackageType[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export function PackageTable({ data, onEdit, onDelete }: PackageTableProps) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [expanded, setExpanded] = React.useState<ExpandedState>({});

	const dataWithActions = React.useMemo(
		() =>
			data.map((item) => ({
				...item,
				onEdit,
				onDelete,
			})),
		[data, onEdit, onDelete],
	);

	const columns = usePackageColumns();

	const table = useReactTable({
		data: dataWithActions,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			expanded,
		},
		onExpandedChange: setExpanded,
		enableExpanding: true,
		enableRowSelection: true,
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
			<PackageTableToolbar table={table} />
			<div className="rounded-md border">
				<Table>
					<colgroup>
						<col style={{ width: "60px" }} />
						<col style={{ width: "20%" }} />
						<col style={{ width: "15%" }} />
						<col style={{ width: "15%" }} />
						<col style={{ width: "40%" }} />
						<col style={{ width: "10%" }} />
					</colgroup>
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
										className={cn(
											"transition-colors hover:bg-muted/50",
											row.getIsExpanded() && "bg-muted/50",
										)}
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
									{row.getIsExpanded() &&
										row.original.metadata.defaultDeliverables && (
											<TableRow className="bg-muted/30">
												<TableCell className="p-0" colSpan={4} />
												<TableCell className="p-0" colSpan={1}>
													<div className="p-4">
														<Table>
															<TableHeader>
																<TableRow className="hover:bg-transparent">
																	<TableHead>Title</TableHead>
																	<TableHead>Status</TableHead>
																	<TableHead className="text-right">
																		Quantity
																	</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{row.original.metadata.defaultDeliverables.map(
																	(deliverable, index) => (
																		<TableRow
																			key={index}
																			className="hover:bg-muted/50 border-0"
																		>
																			<TableCell className="py-2">
																				{deliverable.title}
																			</TableCell>
																			<TableCell className="py-2">
																				<Badge
																					variant={
																						deliverable.is_package_included
																							? "default"
																							: "secondary"
																					}
																				>
																					{deliverable.is_package_included
																						? "Included"
																						: "Add-on"}
																				</Badge>
																			</TableCell>
																			<TableCell className="text-right py-2">
																				{deliverable.quantity}
																			</TableCell>
																		</TableRow>
																	),
																)}
															</TableBody>
														</Table>
													</div>
												</TableCell>
												<TableCell className="p-0" colSpan={1} />
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
									No packages found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<PackageTablePagination table={table} />
		</div>
	);
}
