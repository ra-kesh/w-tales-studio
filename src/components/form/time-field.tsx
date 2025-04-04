"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
	required?: boolean;
};

export const TimeField = ({ label, required }: Props) => {
	const field = useFieldContext<string | undefined>();

	return (
		<div className="space-y-2">
			<div className="space-y-1">
				<Label htmlFor={field.name} className="text-sm font-medium">
					{label ?? null}
					{required && <span className="text-destructive">*</span>}
				</Label>
				{/* <Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={cn(
								"w-full pl-3 text-left font-normal",
								!field.state.value && "text-muted-foreground",
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
				</Popover> */}
				<Select>
					<SelectTrigger className="font-normal focus:ring-0  focus:ring-offset-0 w-full">
						<SelectValue />
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
