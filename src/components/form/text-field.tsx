"use client";

import type React from "react";
import { useFieldContext } from ".";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldErrors } from "./field-errors";

type TextFieldProps = {
	label?: string;
	required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({
	label,
	required,
	...inputProps
}: TextFieldProps) => {
	const field = useFieldContext<string>();

	return (
		<div className="space-y-2">
			<div className="space-y-1">
				<Label htmlFor={field.name} className="text-sm font-medium">
					{label ? label : null}
					{required && <span className="text-destructive">*</span>}
				</Label>
				<Input
					id={field.name}
					value={field.state.value}
					onChange={(e) => field.handleChange(e.target.value)}
					onBlur={field.handleBlur}
					{...inputProps}
				/>
			</div>
			<FieldErrors meta={field.state.meta} />
		</div>
	);
};
