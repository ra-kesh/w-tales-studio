"use client";

import { Button } from "@/components/ui/button";
import { useTaskParams } from "@/hooks/use-task-params";

export function OpenTaskSheet() {
	const { setParams } = useTaskParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createTask: true })}
			>
				Add Task
			</Button>
		</div>
	);
}
