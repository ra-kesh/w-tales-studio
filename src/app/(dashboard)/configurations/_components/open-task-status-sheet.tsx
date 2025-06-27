"use client";

import { Button } from "@/components/ui/button";
import { useTaskStatusParams } from "@/hooks/use-task-status-params";

export function OpenTaskStatusSheet() {
	const { setParams } = useTaskStatusParams();

	return (
		<div>
			<Button onClick={() => setParams({ createTaskStatus: true })}>
				Add Task Status
			</Button>
		</div>
	);
}
