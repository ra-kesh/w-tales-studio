"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TaskForm } from "./task-form";
import type { TaskFormValues } from "../task-form-schema";
import { useTaskParams } from "@/hooks/use-task-params";
import { useCreateTaskMutation } from "@/hooks/use-task-mutation";

export function TaskCreateSheet() {
	const { setParams, createTask } = useTaskParams();
	const isOpen = Boolean(createTask);

	const createTaskMutation = useCreateTaskMutation();

	const handleSubmit = async (data: TaskFormValues) => {
		try {
			await createTaskMutation.mutateAsync(data);
			setParams(null);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Task</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<TaskForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
