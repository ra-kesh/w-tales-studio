"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { DatePicker } from "@/components/ui/date-picker";

export function BookingPaymentForm() {
  const { control } = useFormContext();

  const {
    fields: payments,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({ control, name: "payments" });

  const {
    fields: scheduledPayments,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({ control, name: "scheduledPayments" });

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
          <div className="rounded-md border">
            <div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
              <div className="col-span-3">Amount</div>
              <div className="col-span-3">Paid On</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1" />
            </div>

            {payments.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No payments received yet.
              </div>
            )}

            {payments.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-10 px-4 py-3 gap-4 relative"
              >
                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`payments.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`payments.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* <DatePicker 
                            date={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                          /> */}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`payments.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Payment description" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  variant="outline"
                  className="ml-auto cursor-pointer mt-1.5"
                  size="sm"
                  onClick={() => removePayment(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              appendPayment({ amount: "", date: "", description: "" })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
              <div className="col-span-3">Amount</div>
              <div className="col-span-3">Due Date</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1" />
            </div>

            {scheduledPayments.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No payments scheduled yet.
              </div>
            )}

            {scheduledPayments.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-10 px-4 py-3 gap-4 relative"
              >
                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`scheduledPayments.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`scheduledPayments.${index}.dueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* <DatePicker
                            date={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={field.onChange}
                          /> */}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={control}
                    name={`scheduledPayments.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Schedule description"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  variant="outline"
                  className="ml-auto cursor-pointer mt-1.5"
                  size="sm"
                  onClick={() => removeSchedule(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              appendSchedule({ amount: "", dueDate: "", description: "" })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
