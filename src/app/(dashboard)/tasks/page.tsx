"use client";

import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useTaskPriorities, useTaskStatuses } from "@/hooks/use-configs";
import { useTasks } from "@/hooks/use-tasks";
import { OpenTaskSheet } from "./_components/open-task-sheet";
import { useTaskColumns } from "./_components/task-columns";
import { TaskTable } from "./_components/task-table";
import { TaskTablePagination } from "./_components/task-table-pagination";
import { useMinimalDeliverables } from "@/hooks/use-deliverables";

export default function Tasks() {
  const { data, isPending } = useTasks();

  const { data: statusOptions } = useTaskStatuses();
  const { data: priorityOptions } = useTaskPriorities();

  const {
    data: minimalBookingsResponse,
    isLoading: isMininmalBookingLoading,
    isFetched: isMinimalBookingFetched,
  } = useMinimalBookings();

  const {
    data: minimalDeliverablesResponse,
    isLoading: isMinimalDeliverableLoading,
  } = useMinimalDeliverables();

  const minimalBookings = minimalBookingsResponse?.data;
  const minimalDeliverables = minimalDeliverablesResponse?.data;

  const columns = useTaskColumns({
    statusOptions:
      statusOptions?.map(({ label, value }) => ({ label, value })) ?? [],
    priorityOptions:
      priorityOptions?.map(({ label, value }) => ({ label, value })) ?? [],
    minimalBookings: minimalBookings ?? [],
    minimalDeliverables: minimalDeliverables ?? [],
    isMininmalBookingLoading,
    isMinimalDeliverableLoading,
  });

  const defaultData = React.useMemo(() => [], []);

  const { table } = useBookingTable({
    data: data?.data ?? defaultData,
    pageCount: data?.pageCount ?? 0,
    columns,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="flex-1 min-w-0 py-6">
      {!isMininmalBookingLoading && isMinimalBookingFetched && (
        <DataTableToolbar table={table} className="my-2">
          <OpenTaskSheet />
        </DataTableToolbar>
      )}
      {isPending ? (
        <DataTableSkeleton
          columnCount={4}
          filterCount={0}
          cellWidths={["20rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
          shrinkZero
        />
      ) : (
        <TaskTable table={table} columns={columns}>
          <TaskTablePagination table={table} />
        </TaskTable>
      )}
    </div>
  );
}
