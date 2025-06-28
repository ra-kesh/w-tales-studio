"use client";

import {
	type Table as TanstackTable,
	type ColumnDef,
	flexRender,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { ExpenseTablePagination } from "./expense-table-pagination";
import { ExpenseTableToolbar } from "./expense-table-toolbar";

interface ExpenseTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	table: TanstackTable<TData>;
	children: React.ReactNode;
}

export function ExpenseTable<TData, TValue>({
	columns,
	table,
	children,
}: ExpenseTableProps<TData, TValue>) {
	return (
		<div className="w-full">
			<div className="mt-4 rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
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
			<div className="mt-4">{children}</div>
		</div>
	);
}
