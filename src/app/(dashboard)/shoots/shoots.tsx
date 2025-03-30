"use client";

import { useShootColumns } from "./_components/shoots-table-columns";
import React from "react";
import { ShootsTable } from "./_components/shoots-table";
import { useShoots } from "@/hooks/use-shoots";

export function Shoots() {
  const { data, isLoading, isError } = useShoots();

  const columns = useShootColumns();
  const defaultData = React.useMemo(() => [], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading shoots</div>;
  }

  return (
    <div className="h-full flex-1 flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shoots</h2>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <ShootsTable data={data?.data || defaultData} columns={columns} />
      </div>
    </div>
  );
}
