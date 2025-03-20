"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Divide, Plus } from "lucide-react";
import { useAppForm } from "@/components/form";
import { formOptions, ProjectDetailForm } from "./prject-form";

const ProjeectForm = () => {
  const form = useAppForm({
    ...formOptions,
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
            <ProjectDetailForm form={form} />
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
        <form.AppForm>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.AppForm>
      </form>
    </main>
  );
};

export default ProjeectForm;
