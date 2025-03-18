"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAppForm } from "@/components/form";
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

const ProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  packageType: z.enum(["basic", "premium", "elite", "custom"]),
  packageCost: z.number().min(0, "Package cost must be a positive number"),
  clientName: z.string().min(1, "Client name is required"),
  relation: z
    .enum([
      "bride",
      "groom",
      "father",
      "mother",
      "brother",
      "sister",
      "cousin",
      "other",
      "",
    ])
    .optional(),
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
  packageType: "basic",
  packageCost: 0,
  clientName: "",
  relation: "",
  phone: "",
  shoots: [],
  deliverables: [],
  payments: [],
  receivedAmount: 0,
  dueDate: "",
  contactMethod: "email", // Missing required field
};

const ProjeectForm = () => {
  const form = useAppForm({
    defaultValues: defaultProject,
    validators: {
      onChange: ProjectSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  console.log(form);

  return (
    <main className="container max-w-5xl py-6 md:py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Tabs defaultValue="details" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="shoots">Shoots</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Project Details Tab */}
          <TabsContent value="details" className="space-y-6">
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
                  <div className="space-y-2">
                    <label
                      htmlFor="package-cost"
                      className="text-sm font-medium"
                    >
                      Package cost<span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                      <Input
                        id="package-cost"
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="client-name"
                      className="text-sm font-medium"
                    >
                      Client name<span className="text-destructive">*</span>
                    </label>
                    <Input id="client-name" placeholder="Enter client name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="relation" className="text-sm font-medium">
                      Relation
                    </label>
                    <Select>
                      <SelectTrigger id="relation">
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone number
                    </label>
                    <Input id="phone" placeholder="+91 xxxxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shoots Tab */}
          <TabsContent value="shoots" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shoots</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shoot
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>Title</div>
                    <div>Date</div>
                    <div>Time</div>
                    <div>City</div>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No shoots added yet. Click "Add Shoot" to create one.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Deliverables</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deliverable
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>Title</div>
                    <div>Cost</div>
                    <div>Quantity</div>
                    <div>Due Date</div>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No deliverables added yet. Click "Add Deliverable" to create
                    one.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Amount</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Amount already paid by client while creating this project.
                  This field is optional.
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>Amount</div>
                    <div>Description</div>
                    <div>Paid On</div>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No payments recorded yet.
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Schedule</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>Amount</div>
                    <div>Description</div>
                    <div>Due Date</div>
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No payment schedule created yet.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </main>
  );
};

export default ProjeectForm;
