"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskStatusParams } from "@/hooks/use-task-status-params";
import { TaskStatusForm } from "./task-status-form";
import {
	useTaskStatusDetail,
	useUpdateTaskStatusMutation,
} from "@/hooks/use-configs";
import type { TaskStatusFormValues } from "./task-status-form-schema";
import { toast } from "sonner";

export function TaskStatusEditSheet() {
	const { setParams, taskStatusId } = useTaskStatusParams();
	const isOpen = Boolean(taskStatusId);

	const { data: taskStatusData, isLoading } = useTaskStatusDetail(
		taskStatusId ?? "",
	);
	const updateTaskStatusMutation = useUpdateTaskStatusMutation();

	const handleSubmit = async (data: TaskStatusFormValues) => {
		try {
			await updateTaskStatusMutation.mutateAsync({
				data: {
					value: data.value,
				},
				taskStatusId: taskStatusId as string,
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

	const cleanedDefaultValues = taskStatusData
		? {
				key: taskStatusData.key,
				value: taskStatusData.value,
			}
		: undefined;

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Task Status</SheetTitle>
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
					<TaskStatusForm
						defaultValues={cleanedDefaultValues}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
