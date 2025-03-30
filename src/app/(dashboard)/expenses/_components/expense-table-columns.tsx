"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpenseTableRowActions } from "./expense-table-row-actions";
import type { Expense } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const useExpenseColumns = () => {
  const columns: ColumnDef<Expense>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "bookingName",
      header: "Booking",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("bookingName")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          ${Number(row.getValue("amount")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "billTo",
      header: "Bill To",
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("billTo") === "Client" ? "default" : "secondary"
          }
        >
          {row.getValue("billTo")}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div>{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
      accessorKey: "fileUrls",
      header: "Files",
      cell: ({ row }) => {
        const files = row.getValue("fileUrls") as string[];
        return files?.length ? (
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <FileIcon className="h-4 w-4" />
          </Button>
        ) : null;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ExpenseTableRowActions row={row} />,
    },
  ];

  return columns;
};
