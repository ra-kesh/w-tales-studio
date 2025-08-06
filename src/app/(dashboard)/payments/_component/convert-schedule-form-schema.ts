import { z } from "zod";

export const convertScheduleFormSchema = z.object({
	amount: z.string(),
	paidOn: z.string(),
	description: z.string().optional(),
	attachment: z.any().optional(),
});

export type ConvertScheduleFormValues = z.infer<typeof convertScheduleFormSchema>;
