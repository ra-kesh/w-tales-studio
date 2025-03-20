"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { z } from "zod";

const ContactMethod = z.union([
  z.literal("email"),
  z.literal("phone"),
  z.literal("whatsapp"),
]);
type ContactMethod = z.infer<typeof ContactMethod>;

const ContactMethods = ContactMethod.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const ProjectType = z.union([
  z.literal("wedding"),
  z.literal("birthday"),
  z.literal("engagement"),
  z.literal("anniversary"),
  z.literal("other"),
]);

type ProjectType = z.infer<typeof ProjectType>;

export const ProjectTypes = ProjectType.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const PackageType = z.union([
  z.literal("basic"),
  z.literal("premium"),
  z.literal("elite"),
  z.literal("custom"),
]);

type PackageType = z.infer<typeof PackageType>;

export const PackageTypes = PackageType.options.map(({ value }) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const RelationType = z.union([
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

const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectType: ProjectType,
  packageType: PackageType,
  packageCost: z.string().min(0, "Package cost must be a positive number"),
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
      cost: z.number().min(0, "Cost must be a positive number"),
      quantity: z.number().min(0, "Quantity must be a positive number"),
      dueDate: z.string().min(1, "Due date is required"),
    })
  ),
  payments: z.array(
    z.object({
      amount: z.number().min(0, "Amount must be a positive number"),
      description: z.string().min(1, "Description is required"),
      date: z.string().min(1, "Date is required"),
    })
  ),
  receivedAmount: z
    .number()
    .min(0, "Received amount must be a positive number"),
  dueDate: z.string().min(1, "Due date is required"),
  contactMethod: ContactMethod,
});
type Project = z.infer<typeof ProjectSchema>;

const defaultProject: Project = {
  projectName: "",
  projectType: "wedding",
  packageType: "basic",
  packageCost: "0",
  clientName: "",
  relation: undefined,
  phone: "",
  email: "",
  shoots: [],
  deliverables: [],
  payments: [],
  receivedAmount: 0,
  dueDate: "",
  contactMethod: "phone",
};

export const formOptions = {
  defaultValues: defaultProject,
  validators: {
    onChange: ProjectSchema,
  },
};

export const ProjectDetailForm = withForm({
  ...formOptions,
  render: ({ form }) => {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <form.AppField
                name="projectName"
                children={(field) => (
                  <field.TextField label="Project name" required />
                )}
              />

              <form.AppField
                name="projectType"
                children={(field) => (
                  <field.SelectField
                    label="Project Type"
                    options={ProjectTypes}
                    clasName="w-full"
                  />
                )}
              />
              <form.AppField
                name="packageType"
                children={(field) => (
                  <field.SelectField
                    label="Package Type"
                    options={PackageTypes}
                    clasName="w-full"
                  />
                )}
              />

              <form.AppField
                name="packageCost"
                children={(field) => (
                  <field.PriceField
                    label="Package cost"
                    placeholder="0.00"
                    required
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <form.AppField
                name="clientName"
                children={(field) => (
                  <field.TextField label="Client name" required />
                )}
              />
              <form.AppField
                name="relation"
                children={(field) => (
                  <field.SelectField
                    label="Relation"
                    options={RelationTypes}
                    clasName="w-full"
                  />
                )}
              />

              <form.AppField
                name="phone"
                children={(field) => (
                  <field.TextField
                    label="Phone number"
                    type="tel"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                    required
                    placeholder="+91 xxxxxxxxxx"
                  />
                )}
              />
              <form.AppField
                name="email"
                children={(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="client@example.com"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </>
    );
  },
});
