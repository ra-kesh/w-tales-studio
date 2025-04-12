"use client";

import type React from "react";
import { useFieldContext } from ".";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldErrors } from "./field-errors";
import { Textarea } from "../ui/textarea";

type TextFieldProps = {
	label?: string;
	required?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = ({
	label,
	required,
	...textAreaProps
}: TextFieldProps) => {
	const field = useFieldContext<string>();

	return (
		<div className="space-y-2">
			<div className="space-y-1">
				<Label htmlFor={field.name} className="text-sm font-medium">
					{label ? label : null}
					{required && <span className="text-destructive">*</span>}
				</Label>
				<Textarea
					id={field.name}
					value={field.state.value}
					onChange={(e) => field.handleChange(e.target.value)}
					onBlur={field.handleBlur}
					{...textAreaProps}
				/>
			</div>
			<FieldErrors meta={field.state.meta} />
		</div>
	);
};
