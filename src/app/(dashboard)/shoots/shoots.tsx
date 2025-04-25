"use client";

import { useShootColumns } from "./_components/shoots-table-columns";
import React from "react";
import { ShootsTable } from "./_components/shoots-table";
import { useShoots } from "@/hooks/use-shoots";

export function Shoots() {
  const { data } = useShoots();

  const columns = useShootColumns();
  const defaultData = React.useMemo(() => [], []);

  return (
    <div className="flex-1 min-w-0">
      <ShootsTable data={data?.data || defaultData} columns={columns as any} />
    </div>
  );
}
