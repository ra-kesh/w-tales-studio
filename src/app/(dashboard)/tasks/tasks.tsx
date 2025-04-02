"use client";

import { useTaskColumns } from "./_components/task-columns";
import { TaskTable } from "./_components/task-table";
import { useTasks } from "@/hooks/use-tasks";
import React from "react";

export default function Tasks() {
  const { data } = useTasks();
  const columns = useTaskColumns();
  const defaultData = React.useMemo(() => [], []);

  return (
    <div className="flex-1 min-w-0">
      <TaskTable data={data?.data || defaultData} columns={columns as any} />
    </div>
  );
}
