"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useCrews } from "@/hooks/use-crews";
import { cn } from "@/lib/utils";
import {
	type DeliverableFormValues,
	DeliverableSchema,
	defaultDeliverable,
} from "../deliverable-form-schema";

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
	const params = useParams();
	const bookingIdFromParams = params.id ? params.id.toString() : "";

	const cleanedDefaultValues = {
		bookingId: defaultValues.bookingId?.toString() || bookingIdFromParams || "",
		title: defaultValues.title ?? "",
		dueDate: defaultValues.dueDate ?? "",
		isPackageIncluded: defaultValues.isPackageIncluded ?? true,
		quantity: defaultValues.quantity.toString() ?? "",
		cost: defaultValues.cost.toString() ?? "0",
		notes: defaultValues.notes ?? "",
		crewMembers: defaultValues.crewMembers ?? [],
		status: defaultValues.status ?? "pending",
	};

	const form = useForm<DeliverableFormValues>({
		resolver: zodResolver(DeliverableSchema),
		defaultValues: cleanedDefaultValues,
		mode: "onBlur",
	});

	useEffect(() => {
		if (mode === "create") return;
		form.trigger(); // triggers all form validations when component is mounted
	}, []);

	const { data: MinimalBookings } = useMinimalBookings();
	const bookings = MinimalBookings?.data;

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
				className="grid grid-cols-6 gap-6 px-4"
			>
				<div className="col-span-6">
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
												disabled={mode === "edit" || !!bookingIdFromParams}
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

				<div className="col-span-6">
					<FormField
						control={form.control}
						name="isPackageIncluded"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 ">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked);
											if (checked) {
												form.setValue("cost", "0", { shouldValidate: true });
											}
										}}
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

				<div className="col-span-4">
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
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="min-w-full max-w-full">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="in_progress">In Progress</SelectItem>
										<SelectItem value="in_revision">In Revision</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="delivered">Delivered</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="col-span-2">
					<FormField
						control={form.control}
						name="cost"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Extra Cost</FormLabel>
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

				<div className="col-span-6">
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

				<div className="col-span-6">
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

				<div className="col-span-6 mt-6">
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
