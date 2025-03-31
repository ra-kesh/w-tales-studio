"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DeliverableTableRowActions } from "./deliverable-table-row-actions";
import type { Deliverable } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const useDeliverableColumns = () => {
  const columns: ColumnDef<Deliverable>[] = [
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
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "isPackageIncluded",
      header: "With Package",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isPackageIncluded") ? "outline" : "default"}
        >
          {row.getValue("isPackageIncluded") ? "Included" : "Add-on"}
        </Badge>
      ),
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => (
        <div>
          {row.getValue("cost")
            ? `$${Number(row.getValue("cost")).toFixed(2)}`
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <div>{format(new Date(row.getValue("dueDate")), "MMM dd, yyyy")}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <DeliverableTableRowActions row={row} />,
    },
  ];

  return columns;
};
