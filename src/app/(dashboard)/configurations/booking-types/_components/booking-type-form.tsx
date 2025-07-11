"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { participantRoles } from "@/data/role-data";
import {
	type BookingTypeFormValues,
	BookingTypeSchema,
	defaultBookingType,
} from "./booking-type-form-schema";

interface BookingTypeFormProps {
	defaultValues?: BookingTypeFormValues;
	onSubmit: (data: BookingTypeFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function BookingTypeForm({
	defaultValues = defaultBookingType,
	onSubmit,
	mode = "create",
}: BookingTypeFormProps) {
	const form = useForm<BookingTypeFormValues>({
		resolver: zodResolver(BookingTypeSchema),
		defaultValues,
		mode: "onChange",
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 gap-6 px-4"
			>
				<FormField
					control={form.control}
					name="value"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Booking Type Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g., Wedding" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="metadata.roles"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Applicable Roles</FormLabel>
							<FormControl>
								<MultiAsyncSelect
									options={participantRoles}
									onValueChange={field.onChange}
									defaultValue={field.value}
									placeholder="Select applicable roles..."
									searchPlaceholder="Search roles..."
									className="w-full"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full"
					disabled={!form.formState.isValid || form.formState.isSubmitting}
				>
					{form.formState.isSubmitting
						? mode === "create"
							? "Creating..."
							: "Updating..."
						: mode === "create"
							? "Create Booking Type"
							: "Update Booking Type"}
				</Button>
			</form>
		</Form>
	);
}
