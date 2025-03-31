"use client";

import React from "react";
import { useFieldContext } from ".";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldErrors } from "./field-errors";

type PriceFieldProps = {
  label?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const PriceField = ({
  label,
  required,
  ...inputProps
}: PriceFieldProps) => {
  const field = useFieldContext<string>();
  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    field.handleChange(numericValue);
  };
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {label ?? null}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            className="pl-7"
            id={field.name}
            value={field.state.value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...inputProps}
          />
        </div>
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  );
};
