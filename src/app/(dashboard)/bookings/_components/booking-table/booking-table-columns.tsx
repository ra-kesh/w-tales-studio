"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking, Client, Shoot } from "@/lib/db/schema";
import { BookingTableRowActions } from "./booking-table-row-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, ChevronRight } from "lucide-react";

export const useBookingColumns = () => {
  const columns: ColumnDef<Booking>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "bookingType",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("bookingType")}</div>,
    },
    {
      accessorKey: "packageType",
      header: "Package",
      cell: ({ row }) => <div>{row.getValue("packageType")}</div>,
    },
    {
      accessorKey: "packageCost",
      header: "Cost",
      cell: ({ row }) => (
        <div>
          $
          {new Intl.NumberFormat().format(
            Number.parseFloat(row.getValue("packageCost"))
          )}
        </div>
      ),
    },
    {
      accessorKey: "shoots",
      header: "Shoots",
      cell: ({ row }) => {
        const shoots = row.getValue("shoots") as Shoot[];
        const count = shoots.length;
        const hasShootDetails = count > 0;

        const shootDetailHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          row.toggleExpanded();
        };

        return (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 w-full justify-start transition-colors group",
                hasShootDetails ? "cursor-pointer" : "opacity-50 cursor-default"
              )}
              onClick={hasShootDetails ? shootDetailHandler : undefined}
            >
              <ChevronRight
                className={cn(
                  " h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() && "transform rotate-90"
                )}
              />
              <Camera className="h-4 w-4" />
              <span className="tabular-nums">
                {count ? `${count} shoot(s) scheduled` : "No shoots scheduled"}
              </span>
            </Button>
          </div>
        );
      },
    },

    {
      accessorKey: "clients",
      header: "Contact",
      cell: ({ row }) => {
        const clients = row.getValue("clients") as Client;
        return (
          <div>
            {clients.phoneNumber}
            <br />
            {clients.email}
          </div>
        );
      },
    },

    {
      id: "actions",
      cell: ({ row }) => <BookingTableRowActions row={row} />,
    },
  ];

  return columns;
};
