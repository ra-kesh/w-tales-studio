import { z } from "zod";

export const PackageSchema = z.object({
  key: z.string().min(1, { message: "Key is required" }),
  value: z.string().min(1, { message: "Name is required" }),
  metadata: z.object({
    // maxOutfits: z.number().min(1),
    defaultCost: z.string().min(1),
    // printRights: z.string(),
    // durationUnit: z.string(),
    // maxLocations: z.number().min(1),
    // shootDuration: z.number().min(1),
    // timeframeUnit: z.string(),
    // commercial_use: z.boolean(),
    // includesRetouch: z.boolean(),
    // deliveryTimeframe: z.number().min(1),
    // includesAssistant: z.boolean(),
    defaultDeliverables: z.array(
      z.object({
        title: z.string(),
        quantity: z.number(),
        is_package_included: z.boolean(),
      })
    ),
  }),
});

export type PackageFormValues = z.infer<typeof PackageSchema>;

export const defaultPackage: PackageFormValues = {
  key: "",
  value: "",
  metadata: {
    // maxOutfits: 1,
    defaultCost: "",
    // printRights: "personal",
    // durationUnit: "hours",
    // maxLocations: 1,
    // shootDuration: 1,
    // timeframeUnit: "days",
    // commercial_use: false,
    // includesRetouch: false,
    // deliveryTimeframe: 7,
    // includesAssistant: false,
    defaultDeliverables: [],
  },
};
