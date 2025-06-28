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
import { useTaskStatusParams } from "@/hooks/use-task-status-params";
import { TaskStatusForm } from "./task-status-form";
import { useCreateTaskStatusMutation } from "@/hooks/use-configs";
import type { TaskStatusFormValues } from "./task-status-form-schema";
import { toast } from "sonner";

export function TaskStatusCreateSheet() {
	const { setParams, createTaskStatus } = useTaskStatusParams();
	const isOpen = Boolean(createTaskStatus);

	const createTaskStatusMutation = useCreateTaskStatusMutation();

	const handleSubmit = async (data: TaskStatusFormValues) => {
		try {
			await createTaskStatusMutation.mutateAsync({
				value: data.value,
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
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Task Status</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<TaskStatusForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
