"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiAsyncSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useConfigs } from "@/hooks/use-configs";
import { useCrews } from "@/hooks/use-crews";
import { BillTo } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  defaultExpense,
  type ExpenseFormValues,
  ExpenseSchema,
} from "../expense-form-schema";

interface ExpenseFormProps {
  defaultValues?: ExpenseFormValues;
  onSubmit: (data: ExpenseFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function ExpenseForm({
  defaultValues = defaultExpense,
  onSubmit,
  mode = "create",
}: ExpenseFormProps) {
  const params = useParams();
  const bookingIdFromParams = params.id ? params.id.toString() : "";

  // Clean up default values to only include fields we need
  const cleanedDefaultValues = {
    bookingId: defaultValues.bookingId?.toString() || bookingIdFromParams || "",
    description: defaultValues.description ?? "",
    amount: defaultValues.amount?.toString() ?? "",
    category: defaultValues.category ?? "miscellaneous",
    billTo: defaultValues.billTo ?? BillTo.enumValues[0],
    date: defaultValues.date ?? "",
    crewMembers: defaultValues.crewMembers ?? [],
    fileUrls: defaultValues.fileUrls ?? [],
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: cleanedDefaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (mode === "create") return;
    form.trigger(); // triggers all form validations when component is mounted
  }, []);

  const { data: MinimalBookings } = useMinimalBookings();
  const bookings = MinimalBookings?.data;

  const { data: categories = [] } = useConfigs("expense_category");

  const { data: crewData, isLoading: isLoadingCrew } = useCrews();
  const crewOptions = useMemo(() => {
    if (!crewData?.data) return [];
    return crewData.data.map((crew) => {
      const displayName = crew.member?.user?.name || crew.name;
      const role = crew.role ? ` (${crew.role})` : "";
      const statusBadge =
        crew.status !== "available" ? ` [${crew.status}]` : "";

      return {
        label: `${displayName}${role}${statusBadge}`,
        value: crew.id.toString(),
      };
    });
  }, [crewData?.data]);

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
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={mode === "edit" || !!bookingIdFromParams}
                      >
                        {field.value
                          ? bookings?.find(
                              (booking) =>
                                booking.id === Number.parseInt(field.value)
                            )?.name || "Select a booking"
                          : "Select a booking"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 relative z-50">
                    <Command
                      filter={(value, search) => {
                        if (!bookings) return 0;
                        const booking = bookings.find(
                          (b) => b.id === Number.parseInt(value)
                        );
                        if (!booking) return 0;
                        const searchString = `${booking.name}`.toLowerCase();
                        return searchString.includes(search.toLowerCase())
                          ? 1
                          : 0;
                      }}
                    >
                      <CommandInput placeholder="Search bookings..." />
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
                                    booking.id.toString(),
                                    {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    }
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Expense description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input className="pl-7" placeholder="0.00" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
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
            name="billTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill To</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select billing entity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="crewMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Crew</FormLabel>
                <FormControl>
                  <MultiAsyncSelect
                    options={crewOptions}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    maxCount={5}
                    placeholder="Select crew members"
                    searchPlaceholder="Search crew..."
                    className="w-full"
                    loading={isLoadingCrew}
                  />
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
                ? "Create Expense"
                : "Update Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
