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
import { Check, ChevronsUpDown, Plus, X, Loader2 } from "lucide-react"; // Added Loader2
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CrewSchema,
  type CrewFormValues,
  defaultCrew,
} from "./crew-form-schema";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { useOrganizationMembers } from "@/hooks/use-members"; // Import the new hook

interface CrewFormProps {
  defaultValues?: CrewFormValues;
  onSubmit: (data: CrewFormValues) => Promise<void>;
  mode?: "create" | "edit";
}

export function CrewForm({
  defaultValues = defaultCrew,
  onSubmit,
  mode = "create",
}: CrewFormProps) {
  const form = useForm<CrewFormValues>({
    resolver: zodResolver(CrewSchema),
    defaultValues,
    mode: "onChange",
  });

  // Use the hook to fetch team members
  const {
    data: members = [], // Default to empty array
    isLoading: isLoadingMembers,
    error: membersError,
  } = useOrganizationMembers();

  const [equipment, setEquipment] = useState<string[]>(
    defaultValues.equipment || []
  );
  const equipmentRef = useRef<HTMLInputElement>(null);

  // Find the selected member's name for display
  const getSelectedMemberName = (memberId: string | undefined) => {
    if (!memberId) return "Select team member";
    const member = members.find((m) => m.memberId === memberId);
    return member?.userName || "Select team member";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Team Member (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={isLoadingMembers || !!membersError} // Disable if loading or error
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isLoadingMembers ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Loading...
                            </span>
                          ) : membersError ? (
                            "Error loading members"
                          ) : (
                            getSelectedMemberName(field.value)
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search team members..." />
                        <CommandList>
                          <ScrollArea className="h-64">
                            <CommandEmpty>No team member found.</CommandEmpty>
                            <CommandGroup>
                              {/* Add an option to clear selection */}
                              <CommandItem
                                key="clear-selection"
                                value=""
                                onSelect={() => {
                                  form.setValue("memberId", "", {
                                    shouldValidate: true,
                                  });
                                  form.setValue("email", ""); // Clear email too
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                -- None (External Crew) --
                              </CommandItem>
                              {/* Map over fetched members */}
                              {members.map((member) => (
                                <CommandItem
                                  key={member.memberId}
                                  value={member.memberId} // Use memberId as value
                                  onSelect={() => {
                                    form.setValue("memberId", member.memberId, {
                                      shouldValidate: true,
                                    });
                                    // Pre-fill email if available
                                    if (member.userEmail) {
                                      form.setValue("email", member.userEmail);
                                    } else {
                                      form.setValue("email", ""); // Clear if no email
                                    }
                                    // Clear external name when selecting a member
                                    form.setValue("name", "");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === member.memberId // Compare with memberId
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {member.userName ||
                                    `User (${member.userId.substring(
                                      0,
                                      6
                                    )}...)`}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* Display error from fetching members */}
                  {membersError && (
                    <p className="text-sm text-red-600 mt-1">
                      {membersError.message}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Crew Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name for external crew member"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear memberId when entering external name
                        if (e.target.value) {
                          form.setValue("memberId", "");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
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
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Photographer, Videographer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lead, Assistant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                      {...field}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormLabel>Equipment</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {equipment.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                    onClick={() => {
                      const newEquipment = equipment.filter(
                        (_, i) => i !== index
                      );
                      setEquipment(newEquipment);
                      form.setValue("equipment", newEquipment);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                ref={equipmentRef}
                placeholder="Add equipment (e.g. Camera, Lens)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = equipmentRef.current?.value.trim();
                    if (value) {
                      const newEquipment = [...equipment, value];
                      setEquipment(newEquipment);
                      form.setValue("equipment", newEquipment);
                      equipmentRef.current.value = "";
                    }
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => {
                  const value = equipmentRef.current?.value.trim();
                  if (value) {
                    const newEquipment = [...equipment, value];
                    setEquipment(newEquipment);
                    form.setValue("equipment", newEquipment);
                    equipmentRef.current.value = "";
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            !form.formState.isValid ||
            form.formState.isSubmitting ||
            isLoadingMembers
          } // Also disable submit if members are loading
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Crew Member"
            : "Update Crew Member"}
        </Button>
      </form>
    </Form>
  );
}
