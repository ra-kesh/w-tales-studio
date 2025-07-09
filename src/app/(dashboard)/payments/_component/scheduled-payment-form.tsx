"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { cn } from "@/lib/utils";
import {
	defaultScheduledPayment,
	type ScheduledPaymentFormValues,
	scheduledPaymentFormSchema,
} from "./scheduled-payment-form-schema";

interface ScheduledPaymentFormProps {
	defaultValues?: ScheduledPaymentFormValues;
	onSubmit: (data: ScheduledPaymentFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function ScheduledPaymentForm({
	defaultValues = defaultScheduledPayment,
	onSubmit,
	mode = "create",
}: ScheduledPaymentFormProps) {
	const form = useForm<ScheduledPaymentFormValues>({
		resolver: zodResolver(scheduledPaymentFormSchema),
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
												role="combobox"
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												disabled={mode === "edit"}
											>
												{field.value
													? bookings?.find(
															(b) => b.id === Number.parseInt(field.value),
														)?.name || "Select a booking"
													: "Select a booking"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0 relative z-50">
										<Command>
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
																		{ shouldValidate: true, shouldDirty: true },
																	);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		field.value === booking.id.toString()
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{booking.name}
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

				<div className="col-span-1">
					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Amount</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										placeholder="0.00"
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
						name="dueDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Due Date</FormLabel>
								<FormControl>
									<Input type="date" {...field} />
								</FormControl>
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
								<FormLabel>Description (Optional)</FormLabel>
								<FormControl>
									<Textarea
										placeholder="e.g., Second installment, final balance..."
										{...field}
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
								? "Scheduling Payment..."
								: "Saving Changes..."
							: mode === "create"
								? "Add Scheduled Payment"
								: "Save Changes"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
