"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldContext } from ".";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { FieldErrors } from "./field-errors";
import { Calendar } from "../ui/calendar";

type Props = {
  label?: string;
  required?: boolean;
};

export const DateField = ({ label, required }: Props) => {
  const field = useFieldContext<string | undefined>();

  const parseDate = (value: string | undefined): Date | undefined => {
    return value ? new Date(value) : undefined;
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      field.handleChange(formattedDate);
    } else {
      field.handleChange(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {label ?? null}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.state.value && "text-muted-foreground"
              )}
            >
              {field.state.value ? (
                format(field.state.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(field.state.value)}
              onSelect={handleDateChange}
              disabled={(date) => date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  );
};
