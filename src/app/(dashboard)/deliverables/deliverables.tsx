"use client";

import { useDeliverables } from "@/hooks/use-deliverables";
import { useDeliverableColumns } from "./_components/deliverable-table-columns";
import { DeliverableTable } from "./_components/deliverable-table";
import React from "react";

export function Deliverables() {
  const { data, isLoading, isError } = useDeliverables();
  const columns = useDeliverableColumns();
  const defaultData = React.useMemo(() => [], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading deliverables</div>;
  }

  return (
    <div className="h-full flex-1 flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deliverables</h2>
          <p className="text-muted-foreground">
            Manage your project deliverables and track their status
          </p>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <DeliverableTable data={data?.data || defaultData} columns={columns} />
      </div>
    </div>
  );
}
