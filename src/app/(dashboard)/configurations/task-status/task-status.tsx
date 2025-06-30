"use client";

import { useTaskStatuses } from "@/hooks/use-configs";
import { useTaskStatusParams } from "@/hooks/use-task-status-params";
import { TaskStatusTable } from "../_components/task-status-table";

export default function TaskStatusConfigs() {
	const { data: taskStatus = [] } = useTaskStatuses();
	const { setParams } = useTaskStatusParams();

	const handleEdit = (id: number) => {
		setParams({ taskStatusId: id.toString() });
	};

	const handleDelete = (id: number) => {
		console.log("Delete task status:", id);
	};

	return (
		<div className="space-y-6">
			<TaskStatusTable
				data={taskStatus}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
