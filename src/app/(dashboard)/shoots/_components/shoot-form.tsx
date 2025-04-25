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
import {
  ShootSchema,
  type ShootFormValues,
  defaultShoot,
} from "./shoot-form-schema";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShootFormProps {
  defaultValues?: ShootFormValues;
  onSubmit: (data: ShootFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function ShootForm({
  defaultValues = defaultShoot,
  onSubmit,
  mode = "create",
}: ShootFormProps) {
  const form = useForm<ShootFormValues>({
    resolver: zodResolver(ShootSchema),
    defaultValues,
    mode: "onChange",
  });

  const { data: MinimalBookings } = useMinimalBookings();
  const bookings = MinimalBookings?.data;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-6 px-4"
      >
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="bookingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        // biome-ignore lint/a11y/useSemanticElements: <explanation>
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? bookings?.find(
                              (booking) => booking.id.toString() === field.value
                            )?.name || "Select a booking"
                          : "Select a booking"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 relative z-50">
                    <Command
                      filter={(value, search) => {
                        const booking = bookings?.find(
                          (b) => b.id.toString() === value
                        );
                        if (!booking) return 0;
                        const searchString = `${booking.name}`.toLowerCase();
                        return searchString.includes(search.toLowerCase())
                          ? 1
                          : 0;
                      }}
                    >
                      <CommandInput placeholder="Search bookings by ID..." />
                      <CommandList>
                        <ScrollArea className="h-64">
                          <CommandEmpty>No booking found.</CommandEmpty>
                          <CommandGroup>
                            {bookings?.map((booking) => (
                              <CommandItem
                                key={booking.id}
                                value={booking.id.toString()}
                                onSelect={() => {
                                  form.setValue(
                                    "bookingId",
                                    booking.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === booking.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {booking.name} (ID: {booking.id})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter shoot title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1">
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add any additional notes" {...field} />
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
              ? "Create Shoot"
              : "Update Shoot"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
