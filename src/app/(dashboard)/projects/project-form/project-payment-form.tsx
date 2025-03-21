"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOptions } from "./project-form-schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ProjectPaymentForm = withForm({
  ...formOptions,
  render: ({ form }) => {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Received Amount</CardTitle>
            <p className="text-sm text-muted-foreground">
              Amount already paid by client while creating this project. This
              field is optional.
            </p>
          </CardHeader>
          <CardContent>
            <form.Field name="payments" mode="array">
              {(field) => {
                return (
                  <>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                        <div>Amount</div>
                        <div>Description</div>
                        <div>Paid On</div>
                      </div>

                      {field.state.value.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No payments received yet.
                        </div>
                      )}

                      {field.state.value.map((_, i) => {
                        return (
                          <div key={i} className="grid grid-cols-3 px-4 py-3">
                            <form.AppField
                              name={`payments[${i}].amount`}
                              children={(subField) => (
                                <subField.PriceField placeholder="0.00" />
                              )}
                            />

                            <form.AppField
                              name={`payments[${i}].date`}
                              children={(subField) => (
                                <subField.TextField placeholder="Date" />
                              )}
                            />

                            <form.AppField
                              name={`payments[${i}].description`}
                              children={(subField) => (
                                <subField.TextField placeholder="Description" />
                              )}
                            />
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
                          amount: 0,
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
