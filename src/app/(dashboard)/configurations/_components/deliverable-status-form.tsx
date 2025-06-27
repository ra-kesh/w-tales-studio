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
  DeliverableStatusSchema,
  type DeliverableStatusFormValues,
  defaultDeliverableStatus,
} from "./deliverable-status-form-schema";

interface DeliverableStatusFormProps {
  defaultValues?: DeliverableStatusFormValues;
  onSubmit: (data: DeliverableStatusFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function DeliverableStatusForm({
  defaultValues = defaultDeliverableStatus,
  onSubmit,
  mode = "create",
}: DeliverableStatusFormProps) {
  const form = useForm<DeliverableStatusFormValues>({
    resolver: zodResolver(DeliverableStatusSchema),
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
                <FormLabel>Deliverable Status Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Pending" {...field} />
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
              ? "Create Deliverable Status"
              : "Update Deliverable Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
