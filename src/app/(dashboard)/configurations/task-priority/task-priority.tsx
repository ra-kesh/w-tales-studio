"use client";

import { useTaskPriorities } from "@/hooks/use-configs";
import { useTaskPriorityParams } from "@/hooks/use-task-priority-params";
import { TaskPriorityTable } from "../_components/task-priority-table";

export default function TaskPriorityConfigs() {
	const { data: taskPriority = [] } = useTaskPriorities();
	const { setParams } = useTaskPriorityParams();

	const handleEdit = (id: number) => {
		setParams({ taskPriorityId: id.toString() });
	};

	const handleDelete = (id: number) => {
		console.log("Delete task priority:", id);
	};

	return (
		<div className="space-y-6">
			<TaskPriorityTable
				data={taskPriority}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
