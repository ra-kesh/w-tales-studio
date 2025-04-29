import { z } from "zod";

export const PackageSchema = z.object({
	value: z.string().min(1, { message: "Name is required" }),
	metadata: z.object({
		defaultCost: z.string().min(1),
		defaultDeliverables: z.array(
			z.object({
				title: z.string(),
				quantity: z.string(),
			}),
		),
	}),
});

export type PackageFormValues = z.infer<typeof PackageSchema>;

export const defaultPackage: PackageFormValues = {
	value: "",
	metadata: {
		defaultCost: "",
		defaultDeliverables: [
			{
				title: "",
				quantity: "",
			},
		],
	},
};
