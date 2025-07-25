"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
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
import { MultiAsyncSelect } from "@/components/ui/multi-select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useTaskConfigs } from "@/hooks/use-configs";
import { useCrews } from "@/hooks/use-crews";
import { useMinimalDeliverables } from "@/hooks/use-deliverables";
import { cn } from "@/lib/utils";
import {
	defaultTask,
	type TaskFormValues,
	TaskSchema,
} from "../task-form-schema";

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
	const params = useParams();
	const bookingIdFromParams = params.id ? params.id.toString() : "";

	const cleanedDefaultValues = {
		bookingId: defaultValues.bookingId?.toString() || bookingIdFromParams || "",
		deliverableId: defaultValues.deliverableId?.toString() || "",
		description: defaultValues.description ?? "",
		priority: defaultValues.priority ?? "",
		status: defaultValues.status ?? "todo",
		startDate: defaultValues.startDate ?? "",
		dueDate: defaultValues.dueDate ?? "",
		crewMembers: defaultValues.crewMembers ?? [],
	};

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(TaskSchema),
		defaultValues: cleanedDefaultValues,
		mode: "onChange",
	});

	const { data: MinimalBookings } = useMinimalBookings();
	const bookings = MinimalBookings?.data;

	const selectedBookingId = form.watch("bookingId");
	const { data: MinimalDeliverables, isLoading: isLoadingDeliverables } =
		useMinimalDeliverables(selectedBookingId);
	const deliverables = MinimalDeliverables?.data;

	const { statuses, priorities } = useTaskConfigs();
	const { data: crewData, isLoading: isLoadingCrew } = useCrews();

	const crewOptions = useMemo(() => {
		if (!crewData?.data) return [];
		return crewData.data.map((crew) => {
			const displayName = crew.member?.user?.name || crew.name;
			const role = crew.role ? ` (${crew.role})` : "";
			const statusBadge =
				crew.status !== "available" ? ` [${crew.status}]` : "";

			return {
				label: `${displayName}${role}${statusBadge}`,
				value: crew.id.toString(),
			};
		});
	}, [crewData?.data]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-4 gap-6 px-4"
			>
				<div className="col-span-4">
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
												disabled={mode === "edit" || !!bookingIdFromParams}
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

				<div className="col-span-4">
					<FormField
						control={form.control}
						name="deliverableId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Deliverable </FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-between",
													!field.value && "text-muted-foreground",
												)}
												disabled={!selectedBookingId || isLoadingDeliverables}
											>
												{isLoadingDeliverables
													? "Loading..."
													: field.value
														? deliverables?.find(
																(d) => d.id.toString() === field.value,
															)?.title
														: "Select a deliverable"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0 relative z-50">
										<Command>
											<CommandInput placeholder="Search deliverables..." />
											<CommandList>
												<ScrollArea className="h-48">
													<CommandEmpty>
														No deliverables found for this booking.
													</CommandEmpty>
													<CommandGroup>
														{deliverables?.map((deliverable) => (
															<CommandItem
																key={deliverable.id}
																value={deliverable.id.toString()}
																onSelect={() => {
																	form.setValue(
																		"deliverableId",
																		deliverable.id.toString(),
																		{ shouldValidate: true, shouldDirty: true },
																	);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		field.value === deliverable.id.toString()
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{deliverable.title}
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

				<div className="col-span-4">
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

				<div className="col-span-2">
					<FormField
						control={form.control}
						name="startDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Date</FormLabel>
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

				<div className="col-span-2">
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
																	form.setValue(
																		"priority",
																		priority.value as
																			| "low"
																			| "medium"
																			| "high"
																			| "critical",
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

				<div className="col-span-4">
					<FormField
						control={form.control}
						name="crewMembers"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Assigned Crew</FormLabel>
								<FormControl>
									<MultiAsyncSelect
										options={crewOptions}
										onValueChange={field.onChange}
										defaultValue={field.value}
										maxCount={5}
										placeholder="Select crew members"
										searchPlaceholder="Search crew..."
										className="w-full"
										loading={isLoadingCrew}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-4 mt-6">
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
