import { z } from "zod";

export const DeliverableStatusSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type DeliverableStatusFormValues = z.infer<typeof DeliverableStatusSchema>;

export const defaultDeliverableStatus: DeliverableStatusFormValues = {
  value: "",
};
