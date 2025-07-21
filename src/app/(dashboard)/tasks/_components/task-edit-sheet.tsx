"use client";

import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { usePermissions } from "@/hooks/use-permissions";
import { useUpdateTaskMutation } from "@/hooks/use-task-mutation";
import { useTaskParams } from "@/hooks/use-task-params";
import { useTaskDetails } from "@/hooks/use-tasks";
import type { TaskFormValues } from "../task-form-schema";
import { TaskForm } from "./task-form";

export function TaskEditSheet() {
	const { setParams, taskId } = useTaskParams();
	const { canCreateAndUpdateTask } = usePermissions();

	const isOpen = Boolean(taskId) && canCreateAndUpdateTask;

	const { data: task, isLoading } = useTaskDetails(taskId as string);

	const updateTaskMutation = useUpdateTaskMutation();

	const handleSubmit = async (data: TaskFormValues) => {
		try {
			await updateTaskMutation.mutateAsync({
				data,
				taskId: taskId as string,
			});
			setParams(null);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
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
