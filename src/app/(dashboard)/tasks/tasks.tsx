"use client";

import { useTaskColumns } from "./_components/task-columns";
import { TaskTable } from "./_components/task-table";
import { useTasks } from "@/hooks/use-tasks";
import React from "react";

export default function Tasks() {
  const { data, isLoading, isError } = useTasks();
  const columns = useTaskColumns();
  const defaultData = React.useMemo(() => [], []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading tasks</div>;
  }

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        </div>
      </div>
      <TaskTable data={data?.data || defaultData} columns={columns} />
    </div>
  );
}
