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

interface ExpenseFormProps {
	defaultValues?: ExpenseFormValues;
	onSubmit: (data: ExpenseFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

const EXPENSE_CATEGORIES = [
	"Travel",
	"Equipment",
	"Props",
	"Location",
	"Food",
	"Other",
];

export function ExpenseForm({
	defaultValues = defaultExpense,
	onSubmit,
	mode = "create",
}: ExpenseFormProps) {
	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(ExpenseSchema),
		defaultValues,
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
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select booking" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{bookings?.data?.map((booking) => (
											<SelectItem
												key={booking.id}
												value={booking.id.toString()}
											>
												{booking.name}
											</SelectItem>
										))}
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
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{EXPENSE_CATEGORIES.map((category) => (
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
										<SelectTrigger>
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
