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
	TaskSchema,
	type TaskFormValues,
	defaultTask,
} from "../task-form-schema";

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
import { useTaskConfigs } from "@/hooks/use-configs";

interface TaskFormProps {
	defaultValues?: TaskFormValues;
	onSubmit: (data: TaskFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function TaskForm({
	defaultValues = defaultTask,
	onSubmit,
	mode = "create",
}: TaskFormProps) {
	// Clean up default values to only include fields we need
	const cleanedDefaultValues = {
		bookingId: defaultValues.bookingId?.toString() ?? "",
		// deliverableId: defaultValues.deliverableId?.toString() ?? "",
		description: defaultValues.description ?? "",
		assignedTo: defaultValues.assignedTo ?? "",
		priority: defaultValues.priority ?? "",
		status: defaultValues.status ?? "Todo",
		dueDate: defaultValues.dueDate ?? "",
	};

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(TaskSchema),
		defaultValues: cleanedDefaultValues,
		mode: "onChange",
	});

	const { data: MinimalBookings } = useMinimalBookings();
	const bookings = MinimalBookings?.data;
	const { statuses, priorities } = useTaskConfigs();

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
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												disabled={mode === "edit"}
												type="button"
												aria-expanded={true}
												aria-haspopup="listbox"
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
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Enter task description"
										className="resize-none"
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
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												type="button"
												aria-expanded={true}
												aria-haspopup="listbox"
											>
												{field.value
													? statuses.data?.find(
															(status) => status.value === field.value,
														)?.label || field.value
													: "Select status"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0 relative z-50">
										<Command>
											<CommandInput placeholder="Search status..." />
											<CommandList>
												<ScrollArea className="h-64">
													<CommandEmpty>No status found.</CommandEmpty>
													<CommandGroup>
														{statuses.data?.map((status) => (
															<CommandItem
																key={status.value}
																value={status.value}
																onSelect={() => {
																	form.setValue("status", status.value, {
																		shouldValidate: true,
																		shouldDirty: true,
																	});
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		field.value === status.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{status.label}
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
						name="priority"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Priority</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												type="button"
												aria-expanded={true}
												aria-haspopup="listbox"
											>
												{field.value
													? priorities.data?.find(
															(priority) => priority.value === field.value,
														)?.label || field.value
													: "Select priority"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0 relative z-50">
										<Command>
											<CommandInput placeholder="Search priority..." />
											<CommandList>
												<ScrollArea className="h-64">
													<CommandEmpty>No priority found.</CommandEmpty>
													<CommandGroup>
														{priorities.data?.map((priority) => (
															<CommandItem
																key={priority.value}
																value={priority.value}
																onSelect={() => {
																	form.setValue("priority", priority.value, {
																		shouldValidate: true,
																		shouldDirty: true,
																	});
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		field.value === priority.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{priority.label}
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
						name="assignedTo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Assigned To</FormLabel>
								<FormControl>
									<Input placeholder="Enter assignee" {...field} />
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
								? "Create Task"
								: "Update Task"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
