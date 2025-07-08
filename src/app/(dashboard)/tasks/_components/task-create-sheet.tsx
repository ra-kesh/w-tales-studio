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
import { useCreateTaskMutation } from "@/hooks/use-task-mutation";
import { useTaskParams } from "@/hooks/use-task-params";
import type { TaskFormValues } from "../task-form-schema";
import { TaskForm } from "./task-form";

export function TaskCreateSheet() {
	const { setParams, createTask } = useTaskParams();
	const { canCreateAndUpdateTask } = usePermissions();

	const isOpen = Boolean(createTask) && canCreateAndUpdateTask;

	const createTaskMutation = useCreateTaskMutation();

	const handleSubmit = async (data: TaskFormValues) => {
		try {
			await createTaskMutation.mutateAsync(data);
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
