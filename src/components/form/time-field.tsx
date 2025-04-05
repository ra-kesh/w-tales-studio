"use client";

import { useFieldContext } from ".";
import { Label } from "../ui/label";

import { FieldErrors } from "./field-errors";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
	label?: string;
	placeholder?: string;
	className?: string;
	required?: boolean;
};

export const TimeField = ({ label, required, placeholder }: Props) => {
	const field = useFieldContext<string | undefined>();

	return (
		<div className="space-y-2">
			<div className="space-y-1">
				<Label htmlFor={field.name} className="text-sm font-medium">
					{label ?? null}
					{required && <span className="text-destructive">*</span>}
				</Label>

				<Select
					value={field.state.value}
					onValueChange={(value) => field.handleChange(value)}
				>
					<SelectTrigger className="font-normal focus:ring-0  focus:ring-offset-0 w-full">
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						<ScrollArea className="h-[15rem]">
							{Array.from({ length: 96 }).map((_, i) => {
								const hour = Math.floor(i / 4)
									.toString()
									.padStart(2, "0");
								const minute = ((i % 4) * 15).toString().padStart(2, "0");
								return (
									<SelectItem key={i} value={`${hour}:${minute}`}>
										{hour}:{minute}
									</SelectItem>
								);
							})}
						</ScrollArea>
					</SelectContent>
				</Select>
			</div>
			<FieldErrors meta={field.state.meta} />
		</div>
	);
};
