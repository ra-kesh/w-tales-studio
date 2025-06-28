import { z } from "zod";

export const TaskPrioritySchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type TaskPriorityFormValues = z.infer<typeof TaskPrioritySchema>;

export const defaultTaskPriority: TaskPriorityFormValues = {
  value: "",
};
