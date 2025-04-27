"use client";

import { Button } from "@/components/ui/button";
import { useTaskParams } from "@/hooks/use-task-params";

export function OpenTaskSheet() {
	const { setParams } = useTaskParams();

	return (
		<div>
			<Button onClick={() => setParams({ createTask: true })}>Add Task</Button>
		</div>
	);
}
