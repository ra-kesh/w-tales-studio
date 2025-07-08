"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { useTaskParams } from "@/hooks/use-task-params";

export function OpenTaskSheet() {
	const { setParams } = useTaskParams();

	const { canCreateAndUpdateTask } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createTask: true })}
				disabled={!canCreateAndUpdateTask}
			>
				Add Task
			</Button>
		</div>
	);
}
