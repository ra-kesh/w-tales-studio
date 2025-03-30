"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { useExpenseColumns } from "./_components/expense-table-columns";
import { ExpenseTable } from "./_components/expense-table";
import React from "react";

export function Expenses() {
  const { data, isLoading, isError } = useExpenses();
  const columns = useExpenseColumns();
  const defaultData = React.useMemo(() => [], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading expenses</div>;
  }

  return (
    <div className="h-full flex-1 flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage project-related expenses
          </p>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <ExpenseTable data={data?.data || defaultData} columns={columns} />
      </div>
    </div>
  );
}
