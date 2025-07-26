"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CalendarIcon,
  Camera,
  ChevronRight,
  Mail,
  PackageIcon,
  Phone,
  Text,
  Users,
} from "lucide-react";
import type { PackageMetadata } from "@/app/(dashboard)/configurations/packages/_components/package-form-schema";
import { DataTableColumnHeader } from "@/app/(dashboard)/tasks/_components/task-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Booking, Client, Shoot } from "@/lib/db/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Participant } from "../booking-form/booking-form-schema";
import { BookingTableRowActions } from "./booking-table-row-actions";

export const useBookingColumns = ({
  packageTypes,
  isPackageTypesLoading,
}: {
  packageTypes:
    | { id: number; value: string; label: string; metadata: PackageMetadata }[]
    | undefined;
  isPackageTypesLoading: boolean;
}) => {
  const columns: ColumnDef<
    Booking & { shoots: Shoot[]; participants: Participant[] }
  >[] = [
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
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const bookingName = row.getValue("name") as string;
        const type = row.original.bookingType;
        return (
          <div className="flex items-center gap-3">
            {/* <Badge variant="outline">{type || "Not specified"}</Badge> */}
            <div className="font-medium">{bookingName}</div>
          </div>
        );
      },
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: "packageType",
      accessorKey: "packageType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Package" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-md ">
            {
              packageTypes?.find(
                (packageType) => packageType.value === row.original.packageType
              )?.label
            }
          </span>
        );
      },
      meta: {
        label: "Package",
        variant: "multiSelect",
        options: isPackageTypesLoading
          ? []
          : (packageTypes?.map((type) => ({
              label: type.label,
              value: type.value,
            })) ?? []),
        icon: PackageIcon,
      },
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "packageCost",
      accessorKey: "packageCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cost" />
      ),
      cell: ({ row }) => {
        const cost = row.original.packageCost;
        const formatted = formatCurrency(cost);
        // typeof cost === "number" || typeof cost === "string"
        // 	? new Intl.NumberFormat("en-US", {
        // 			style: "currency",
        // 			currency: "INR",
        // 			minimumFractionDigits: 0,
        // 			maximumFractionDigits: 0,
        // 		}).format(Number(cost))
        // 	: "$0";

        return <span className=" font-medium tabular-nums">{formatted}</span>;
      },
    },

    {
      accessorKey: "shoots",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Shoots</span>
          <Calendar className="h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => {
        const shoots = row.getValue("shoots") as Shoot[];
        const count = shoots?.length || 0;
        const hasShootDetails = count > 0;

        const shootDetailHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          row.toggleExpanded();
        };

        return (
          <div className="relative">
            <Button
              variant={hasShootDetails ? "outline" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 w-full justify-start transition-colors group",
                hasShootDetails
                  ? "cursor-pointer hover:bg-primary/5 border-primary/20"
                  : "opacity-70 cursor-default text-muted-foreground"
              )}
              onClick={hasShootDetails ? shootDetailHandler : undefined}
            >
              {hasShootDetails && (
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-primary transition-transform duration-200",
                    row.getIsExpanded() && "transform rotate-90"
                  )}
                />
              )}
              <Camera
                className={cn(
                  "h-4 w-4",
                  hasShootDetails ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col items-start">
                <span className="tabular-nums font-medium">
                  {count
                    ? `${count} shoot${count > 1 ? "s" : ""} scheduled`
                    : "No shoots scheduled"}
                </span>
              </div>
            </Button>
          </div>
        );
      },
    },

    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: "Created",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },

    {
      id: "participants",
      accessorKey: "participants",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Clients" />
      ),
      cell: ({ row }) => {
        const participants =
          (row.getValue("participants") as Participant[]) || [];

        if (!participants.length) {
          return <div className="text-muted-foreground">No participants</div>;
        }

        // 1) define your display priority

        // only show up to 2 badges inline
        const MAX_VISIBLE = 2;
        const visible = participants.slice(0, MAX_VISIBLE);
        const hiddenCount = participants.length - visible.length;

        return (
          <div className="flex flex-wrap items-center gap-1">
            {visible.map(({ id, role, client }) => (
              <Badge key={id} variant="secondary" className="capitalize">
                {client.name}
              </Badge>
            ))}

            {hiddenCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline">+{hiddenCount} more</Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      {participants.map(({ id, role, client }) => (
                        <div key={id} className="text-sm">
                          {client.name}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        label: "Participants",
        icon: Users,
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <BookingTableRowActions row={row} />,
    },
  ];

  return columns;
};
