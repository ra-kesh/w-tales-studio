"use client";

import { Button } from "@/components/ui/button";
import { useTaskPriorityParams } from "@/hooks/use-task-priority-params";

export function OpenTaskPrioritySheet() {
	const { setParams } = useTaskPriorityParams();

	return (
		<div>
			<Button
				size="sm"
				className="  font-semibold cursor-pointer"
				onClick={() => setParams({ createTaskPriority: true })}
			>
				Add Task Priority
			</Button>
		</div>
	);
}
