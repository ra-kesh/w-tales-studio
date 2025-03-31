"use client";

import { useClients } from "@/hooks/use-clients";
import { useClientColumns } from "./_components/client-table-columns";
import { ClientTable } from "./_components/client-table";
import React from "react";

export function Clients() {
  const { data, isLoading, isError } = useClients();
  const columns = useClientColumns();
  const defaultData = React.useMemo(() => [], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading clients</div>;
  }

  return (
    <div className="h-full flex-1 flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships and bookings
          </p>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <ClientTable data={data?.data || defaultData} columns={columns} />
      </div>
    </div>
  );
}
