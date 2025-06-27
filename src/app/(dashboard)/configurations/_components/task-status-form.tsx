"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  TaskStatusSchema,
  type TaskStatusFormValues,
  defaultTaskStatus,
} from "./task-status-form-schema";

interface TaskStatusFormProps {
  defaultValues?: TaskStatusFormValues;
  onSubmit: (data: TaskStatusFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function TaskStatusForm({
  defaultValues = defaultTaskStatus,
  onSubmit,
  mode = "create",
}: TaskStatusFormProps) {
  const form = useForm<TaskStatusFormValues>({
    resolver: zodResolver(TaskStatusSchema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 px-4"
      >
        <div>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Status Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. To Do" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Task Status"
              : "Update Task Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
