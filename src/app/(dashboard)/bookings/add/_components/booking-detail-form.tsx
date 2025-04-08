"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingTypes, usePackageTypes } from "@/hooks/use-configs";
import type { Booking } from "./booking-form-schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface BookingDetailFormProps {
  form: UseFormReturn<Booking>;
}

export const BookingDetailForm = () => {
  const form = useFormContext();

  const { data: packageTypes = [] } = usePackageTypes();
  const { data: bookingTypes = [] } = useBookingTypes();
  // const bookingType = form.watch("bookingType");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="bookingName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Booking Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={form.control}
                name="bookingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-w-full">
                          <SelectValue placeholder="Select booking type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={form.control}
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedPackage = packageTypes.find(
                          (pkg) => pkg.value === value
                        );
                        if (selectedPackage?.metadata) {
                          form.setValue(
                            "packageCost",
                            selectedPackage.metadata.defaultCost ?? ""
                          );
                          if (
                            selectedPackage.metadata.defaultDeliverables
                              ?.length > 0
                          ) {
                            const formattedDeliverables =
                              selectedPackage.metadata.defaultDeliverables.map(
                                (del) => ({
                                  title: del.title,
                                  cost: "0",
                                  quantity: String(del.quantity ?? 1),
                                  dueDate: "",
                                })
                              );
                            form.setValue(
                              "deliverables",
                              formattedDeliverables
                            );
                          } else {
                            form.setValue("deliverables", []);
                          }
                        } else {
                          form.setValue("packageCost", "");
                          form.setValue("deliverables", []);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="min-w-full">
                          <SelectValue placeholder="Select package type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="packageCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Cost</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input className="pl-7" {...field} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Client Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="brideName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bride Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Groom Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
