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
import { Textarea } from "@/components/ui/textarea";
import {
	DeliverableSchema,
	type DeliverableFormValues,
	defaultDeliverable,
} from "../deliverable-form-schema";

import { Check, ChevronsUpDown } from "lucide-react";
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
import { useMinimalBookings } from "@/hooks/use-bookings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

interface DeliverableFormProps {
	defaultValues?: DeliverableFormValues;
	onSubmit: (data: DeliverableFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function DeliverableForm({
	defaultValues = defaultDeliverable,
	onSubmit,
	mode = "create",
}: DeliverableFormProps) {
	// Clean up default values to only include fields we need
	const cleanedDefaultValues = {
		bookingId: defaultValues.bookingId?.toString() ?? "",
		title: defaultValues.title ?? "",
		dueDate: defaultValues.dueDate ?? "",
		isPackageIncluded: defaultValues.isPackageIncluded ?? true,
		quantity: defaultValues.quantity.toString() ?? "",
		cost: defaultValues.cost.toString() ?? "0",
		notes: defaultValues.notes ?? "",
	};

	const form = useForm<DeliverableFormValues>({
		resolver: zodResolver(DeliverableSchema),
		defaultValues: cleanedDefaultValues,
		mode: "onBlur",
	});

	useEffect(() => {
		form.trigger(); // triggers all form validations when component is mounted
	}, []);

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
												// biome-ignore lint/a11y/useSemanticElements: <explanation>
												role="combobox"
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												disabled={mode === "edit"}
											>
												{field.value
													? bookings?.find(
															(booking) =>
																booking.id === Number.parseInt(field.value),
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
													(b) => b.id === Number.parseInt(value),
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
																		},
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
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input placeholder="Enter deliverable title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-2">
					<FormField
						control={form.control}
						name="isPackageIncluded"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Package Included</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-1">
					<FormField
						control={form.control}
						name="cost"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cost</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										placeholder="0.00"
										disabled={form.watch("isPackageIncluded")}
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
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input type="number" step="0.01" placeholder="1" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-2">
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
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notes</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Add any additional notes"
										className="resize-none"
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
								? "Creating..."
								: "Updating..."
							: mode === "create"
								? "Create Deliverable"
								: "Update Deliverable"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
