"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import {
  formOptions,
  PackageTypes,
  ProjectTypes,
  RelationTypes,
} from "./project-form-schema";

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
                    className="w-full"
                  />
                )}
              />
              <form.AppField
                name="packageType"
                children={(field) => (
                  <field.SelectField
                    label="Package Type"
                    options={PackageTypes}
                    className="w-full"
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
                    className="w-full"
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
