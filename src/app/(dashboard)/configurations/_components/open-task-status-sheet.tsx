"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { useTaskStatusParams } from "@/hooks/use-task-status-params";

export function OpenTaskStatusSheet() {
	const { setParams } = useTaskStatusParams();

	const { canCreateAndUpdateTaskStatus } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createTaskStatus: true })}
				disabled={!canCreateAndUpdateTaskStatus}
			>
				Add Task Status
			</Button>
		</div>
	);
}
