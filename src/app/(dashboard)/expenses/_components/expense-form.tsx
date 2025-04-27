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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ExpenseSchema,
	type ExpenseFormValues,
	defaultExpense,
} from "../expense-form-schema";
import { useBookings } from "@/hooks/use-bookings";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpenseCategory, BillTo } from "@/lib/db/schema";

interface ExpenseFormProps {
	defaultValues?: ExpenseFormValues;
	onSubmit: (data: ExpenseFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function ExpenseForm({
	defaultValues = defaultExpense,
	onSubmit,
	mode = "create",
}: ExpenseFormProps) {
	// Clean up default values to only include fields we need
	const cleanedDefaultValues = {
		bookingId: defaultValues.bookingId?.toString() ?? "",
		description: defaultValues.description ?? "",
		amount: defaultValues.amount?.toString() ?? "",
		category: defaultValues.category ?? ExpenseCategory.CUSTOM,
		billTo: defaultValues.billTo ?? BillTo.STUDIO,
		date: defaultValues.date ?? "",
		fileUrls: defaultValues.fileUrls ?? [],
	};

	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(ExpenseSchema),
		defaultValues: cleanedDefaultValues,
		mode: "onChange",
	});

	const { data: bookings } = useBookings();

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
													? bookings?.data?.find(
															(booking) =>
																booking.id ===
																Number.parseInt(field.value || ""),
														)?.name || "Select booking"
													: "Select booking"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0 relative z-50">
										<Command
											filter={(value, search) => {
												if (!bookings?.data) return 0;
												const booking = bookings.data.find(
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
														{bookings?.data?.map((booking) => (
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
																		field.value &&
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
									<Input placeholder="Expense description" {...field} />
								</FormControl>
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
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
											$
										</span>
										<Input className="pl-7" placeholder="0.00" {...field} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-1">
					<FormField
						control={form.control}
						name="category"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Category</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.values(ExpenseCategory).map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-1">
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Date</FormLabel>
								<FormControl>
									<Input type="date" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-1">
					<FormField
						control={form.control}
						name="billTo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Bill To</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select billing entity" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="Client">Client</SelectItem>
										<SelectItem value="Studio">Studio</SelectItem>
									</SelectContent>
								</Select>
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
								? "Create Expense"
								: "Update Expense"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
