"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOptions } from "./project-form-schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export const ProjectPaymentForm = withForm({
  ...formOptions,
  render: ({ form }) => {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Received Payments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Amount already paid by client while creating this project.
            </p>
          </CardHeader>
          <CardContent>
            <form.Field name="payments" mode="array">
              {(field) => {
                return (
                  <>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
                        <div className="col-span-3">Amount</div>
                        <div className="col-span-3">Paid On</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1"></div>
                      </div>

                      {field.state.value.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No payments received yet.
                        </div>
                      )}

                      {field.state.value.map((_, i) => {
                        return (
                          <div
                            key={i}
                            className="grid grid-cols-10 px-4 py-3 gap-4 relative"
                          >
                            <div className="col-span-3">
                              <form.AppField
                                name={`payments[${i}].amount`}
                                children={(subField) => <subField.PriceField />}
                              />
                            </div>

                            <div className="col-span-3">
                              <form.AppField
                                name={`payments[${i}].date`}
                                children={(subField) => <subField.DateField />}
                              />
                            </div>

                            <div className="col-span-3">
                              <form.AppField
                                name={`payments[${i}].description`}
                                children={(subField) => <subField.TextField />}
                              />
                            </div>

                            <Button
                              variant={"outline"}
                              className="ml-auto cursor-pointer mt-1.5"
                              size="sm"
                              onClick={() => field.removeValue(i)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        field.pushValue({
                          amount: "",
                          description: "",
                          date: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </>
                );
              }}
            </form.Field>
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
      </>
    );
  },
});
