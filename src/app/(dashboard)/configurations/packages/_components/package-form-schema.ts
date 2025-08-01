import { z } from "zod/v4";

export const PackageSchema = z.object({
	value: z.string().min(1, {
        error: "Name is required"
    }),
	metadata: z.object({
		defaultCost: z.string().min(1, {
            error: "Default cost is required"
        }),
		defaultDeliverables: z
			.array(
				z.object({
					title: z
						.string()
						.min(1, {
                            error: "At least one deliverable is required"
                        }),
					quantity: z.string(),
				}),
			)
			.min(1, {
                error: "At least one deliverable is required"
            }),

		bookingType: z.string().optional(),
	}),
});

export type PackageFormValues = z.infer<typeof PackageSchema>;

export const PackageMetadataSchema = z.object({
	defaultCost: z.string(),
	defaultDeliverables: z.array(
		z.object({
			title: z.string(),
			quantity: z.string(),
		}),
	),
	bookingType: z.string().optional(),
});

export type PackageMetadata = z.infer<typeof PackageMetadataSchema>;

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

		bookingType: "",
	},
};
