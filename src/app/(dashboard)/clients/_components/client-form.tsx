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
import { Textarea } from "@/components/ui/textarea";

import type { ClientFormValues } from "./client-form-schema";
import { ClientSchema, defaultClient } from "./client-form-schema";

interface ClientFormProps {
  defaultValues?: ClientFormValues;
  onSubmit: (data: ClientFormValues) => void;
  mode?: "create" | "edit";
}

export function ClientForm({
  defaultValues = defaultClient,
  onSubmit,
  mode = "create",
}: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(ClientSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-6 px-4"
      >
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 col-span-2">
          <FormField
            control={form.control}
            name="brideName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bride Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bride name" {...field} />
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
                  <Input placeholder="Enter groom name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 col-span-2">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
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
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter client address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2 mt-6">
          <Button
            type="submit"
            className="min-w-full"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Client"
              : "Update Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
