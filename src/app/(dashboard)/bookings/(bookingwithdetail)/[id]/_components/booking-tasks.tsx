"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/db/schema";
import { TaskTable } from "@/app/(dashboard)/tasks/_components/task-table";
import { useBookingTaskColumns } from "./booking-task-columns";

export function BookingTasks({ tasks }: { tasks: Task[] }) {
	const columns = useBookingTaskColumns();

	return (
		<div className="space-y-4">
			<TaskTable data={tasks} columns={columns as any} />
		</div>
	);
}
