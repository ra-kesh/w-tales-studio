import { z } from "zod/v4";

export const TaskStatusSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type TaskStatusFormValues = z.infer<typeof TaskStatusSchema>;

export const defaultTaskStatus: TaskStatusFormValues = {
  value: "",
};
