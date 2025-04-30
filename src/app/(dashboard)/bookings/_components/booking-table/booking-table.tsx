"use client";

import * as React from "react";
import {
  useReactTable,
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
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BookingTablePagination } from "./booking-table-pagination";
import { BookingTableToolbar } from "./booking-table-toolbar";
import { useRouter } from "next/navigation";
import type { Booking, Shoot } from "@/lib/db/schema";
import { format } from "date-fns";

interface BookingTableProps {
  columns: ColumnDef<Booking & { shoots: Shoot[] }>[];
  data: (Booking & { shoots: Shoot[] })[];
}

export function BookingTable({ columns, data }: BookingTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
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

  const handleRowClick = (id: number) => {
    router.push(`/bookings/${id}`);
  };

  return (
    <div className="space-y-4">
      <BookingTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "5%" }} />
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
                            header.getContext()
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
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && row.original.shoots && (
                    <TableRow className="bg-muted/30">
                      <TableCell className="p-0" colSpan={5} />
                      <TableCell className="p-0" colSpan={1}>
                        <div className="p-4">
                          <Table>
                            <TableBody>
                              {row.original.shoots.map((shoot, index) => (
                                <TableRow
                                  key={index}
                                  className="hover:bg-muted/50 border-0"
                                >
                                  <TableCell className="py-2">
                                    <div>{shoot.title}</div>
                                    <div>{shoot.location as string}</div>
                                  </TableCell>

                                  <TableCell className="text-right py-2">
                                    <div>{shoot.time}</div>
                                    <div>
                                      {shoot.date
                                        ? format(
                                            new Date(shoot.date),
                                            "MMM dd, yyyy"
                                          )
                                        : "No date"}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                      <TableCell className="p-0" colSpan={1} />
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <BookingTablePagination table={table} />
    </div>
  );
}
