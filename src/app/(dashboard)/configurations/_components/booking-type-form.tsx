"use client";

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
  BookingSchema,
  type BookingFormValues,
  defaultBookingType,
} from "./booking-type-form-schema";

interface BookingTypeFormProps {
  defaultValues?: BookingFormValues;
  onSubmit: (data: BookingFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function BookingTypeForm({
  defaultValues = defaultBookingType,
  onSubmit,
  mode = "create",
}: BookingTypeFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingSchema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 px-4"
      >
        <div>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Type Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Wedding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
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
              ? "Create Booking Type"
              : "Update Booking Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
