"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOptions } from "./project-form-schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ProjectDeliveryForm = withForm({
  ...formOptions,
  render: ({ form }) => {
    return (
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
              No deliverables added yet. Click "Add Deliverable" to create one.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
});
