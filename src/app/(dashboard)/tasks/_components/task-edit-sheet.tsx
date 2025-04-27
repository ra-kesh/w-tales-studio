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
import { useTaskDetails } from "@/hooks/use-tasks";
import { useTaskParams } from "@/hooks/use-task-params";
import { useUpdateTaskMutation } from "@/hooks/use-task-mutation";

export function TaskEditSheet() {
	const { setParams, taskId } = useTaskParams();
	const isOpen = Boolean(taskId);

	const { data: task, isLoading, refetch } = useTaskDetails(taskId as string);

	const updateTaskMutation = useUpdateTaskMutation();

	const handleSubmit = async (data: TaskFormValues) => {
		try {
			await updateTaskMutation.mutate({
				data,
				taskId: taskId as string,
			});
			refetch();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Task</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<TaskForm defaultValues={task} onSubmit={handleSubmit} mode="edit" />
				)}
			</SheetContent>
		</Sheet>
	);
}
