"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  PackageSchema,
  type PackageFormValues,
  defaultPackage,
} from "./package-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageFormProps {
  defaultValues?: PackageFormValues;
  onSubmit: (data: PackageFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function PackageForm({
  defaultValues = defaultPackage,
  onSubmit,
  mode = "create",
}: PackageFormProps) {
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(PackageSchema),
    defaultValues,
    mode: "onChange",
  });

  const lastDeliverableRef = useRef<HTMLDivElement | null>(null);

  const deliverables = form.watch("metadata.defaultDeliverables");

  useEffect(() => {
    if (lastDeliverableRef.current) {
      lastDeliverableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [deliverables.length]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-5 gap-6 px-4"
      >
        <div className="col-span-3">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Basic Package" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="metadata.defaultCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Cost</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input className="pl-7" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Deliverables</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentDeliverables = form.getValues(
                  "metadata.defaultDeliverables"
                );
                form.setValue("metadata.defaultDeliverables", [
                  ...currentDeliverables,
                  { title: "", quantity: "" },
                ]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto pr-4 pl-1 pb-1">
              <div className="space-y-4">
                {form.watch("metadata.defaultDeliverables")?.map((_, index) => (
                  <div
                    ref={
                      index === deliverables.length - 1
                        ? lastDeliverableRef
                        : null
                    }
                    key={index}
                    className="grid grid-cols-6 gap-4"
                  >
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`metadata.defaultDeliverables.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={cn(index !== 0 && "sr-only")}>
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`metadata.defaultDeliverables.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={cn(index !== 0 && "sr-only")}>
                              Quantity
                            </FormLabel>
                            <FormControl>
                              <Input type="number" step="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentDeliverables = form.getValues(
                            "metadata.defaultDeliverables"
                          );
                          form.setValue(
                            "metadata.defaultDeliverables",
                            currentDeliverables.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-5">
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Package"
              : "Update Package"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
