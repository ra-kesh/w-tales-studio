import { z } from "zod";

export const RequiredPositiveWholeNumber = z.union([
  z.coerce
    .number({
      message: "must be a number",
    })
    .int({
      message: "must be a whole number",
    })
    .positive({
      message: "must be positive",
    }),
  z.literal("").refine(() => false, {
    message: "required",
  }),
]);

export type RequiredPositiveWholeNumber = z.infer<
  typeof RequiredPositiveWholeNumber
>;

export const OptionalPositiveWholeNumber = z
  .union([
    z.coerce
      .number({
        message: "must be a number",
      })
      .int({
        message: "must be a whole number",
      })
      .positive({
        message: "must be positive",
      }),
    z.literal(""),
  ])
  .optional();

export const ContactMethod = z.union([
  z.literal("email"),
  z.literal("phone"),
  z.literal("whatsapp"),
]);
export type ContactMethod = z.infer<typeof ContactMethod>;

export const ContactMethods = ContactMethod.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const ProjectType = z.union([
  z.literal("wedding"),
  z.literal("birthday"),
  z.literal("engagement"),
  z.literal("anniversary"),
  z.literal("other"),
]);

export type ProjectType = z.infer<typeof ProjectType>;

export const ProjectTypes = ProjectType.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const PackageType = z.union([
  z.literal("basic"),
  z.literal("premium"),
  z.literal("elite"),
  z.literal("custom"),
]);

export type PackageType = z.infer<typeof PackageType>;

export const PackageTypes = PackageType.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const RelationType = z.union([
  z.literal("bride"),
  z.literal("groom"),
  z.literal("father"),
  z.literal("mother"),
  z.literal("brother"),
  z.literal("sister"),
  z.literal("cousin"),
  z.literal("other"),
]);

export type RelationType = z.infer<typeof RelationType>;

export const RelationTypes = RelationType.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectType: ProjectType,
  packageType: PackageType,
  packageCost: RequiredPositiveWholeNumber,
  clientName: z.string().min(1, "Client name is required"),
  relation: RelationType.optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional(),
  shoots: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      date: z.string().min(1, "Date is required"),
      time: z.string().min(1, "Time is required"),
      city: z.string().min(1, "City is required"),
    })
  ),
  deliverables: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      cost: RequiredPositiveWholeNumber,
      quantity: RequiredPositiveWholeNumber,
      dueDate: z.string().min(1, "Due date is required"),
    })
  ),
  payments: z.array(
    z.object({
      amount: RequiredPositiveWholeNumber,
      description: z.string().optional(),
      date: z.string(),
    })
  ),
  scheduledPayments: z.array(
    z.object({
      amount: RequiredPositiveWholeNumber,
      description: z.string().min(1, "Description is required"),
      dueDate: z.string().min(1, "Due date is required"),
    })
  ),
  receivedAmount: OptionalPositiveWholeNumber,
  dueDate: z.string().min(1, "Due date is required"),
  contactMethod: ContactMethod,
});
export type Project = z.infer<typeof ProjectSchema>;

export const defaultProject: Project = {
  projectName: "",
  projectType: "wedding",
  packageType: "basic",
  packageCost: "",
  clientName: "",
  relation: undefined,
  phone: "",
  email: "",
  shoots: [],
  deliverables: [],
  payments: [],
  scheduledPayments: [],
  receivedAmount: "",
  dueDate: "",
  contactMethod: "phone",
};

export const formOptions = {
  defaultValues: defaultProject,
  validators: {
    onChange: ProjectSchema,
  },
};
