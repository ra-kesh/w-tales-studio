"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function BookingPaymentForm() {
	const { control } = useFormContext();

	const {
		fields: payments,
		append: appendPayment,
		remove: removePayment,
	} = useFieldArray({ control, name: "payments" });

	const {
		fields: scheduledPayments,
		append: appendSchedule,
		remove: removeSchedule,
	} = useFieldArray({ control, name: "scheduledPayments" });

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Received Payments</CardTitle>
					<Button
						size="sm"
						type="button"
						variant="outline"
						onClick={() =>
							appendPayment({ amount: "", date: "", description: "" })
						}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Payment
					</Button>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
							<div className="col-span-3">Amount</div>
							<div className="col-span-3">Paid On</div>
							<div className="col-span-3">Description</div>
							<div className="col-span-1" />
						</div>

						{payments.length === 0 && (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No payments received yet.
							</div>
						)}

						{payments.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-10 px-4 py-3 gap-4 relative"
							>
								<div className="col-span-3">
									<FormField
										control={control}
										name={`payments.${index}.amount`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="number" placeholder="0.00" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-3">
									<FormField
										control={control}
										name={`payments.${index}.date`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-3">
									<FormField
										control={control}
										name={`payments.${index}.description`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Payment description" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-1 flex flex-row items-center">
									<Button
										variant="outline"
										className="ml-auto cursor-pointer"
										size="sm"
										onClick={() => removePayment(index)}
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Payment Schedule</CardTitle>
					<Button
						size="sm"
						type="button"
						variant="outline"
						onClick={() =>
							appendSchedule({ amount: "", dueDate: "", description: "" })
						}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Schedule
					</Button>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
							<div className="col-span-3">Amount</div>
							<div className="col-span-3">Due Date</div>
							<div className="col-span-3">Description</div>
							<div className="col-span-1" />
						</div>

						{scheduledPayments.length === 0 && (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No payments scheduled yet.
							</div>
						)}

						{scheduledPayments.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-10 px-4 py-3 gap-4 relative"
							>
								<div className="col-span-3">
									<FormField
										control={control}
										name={`scheduledPayments.${index}.amount`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="number" placeholder="0.00" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-3">
									<FormField
										control={control}
										name={`scheduledPayments.${index}.dueDate`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-3">
									<FormField
										control={control}
										name={`scheduledPayments.${index}.description`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														placeholder="Schedule description"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<Button
									variant="outline"
									className="ml-auto cursor-pointer mt-1.5"
									size="sm"
									onClick={() => removeSchedule(index)}
								>
									<Trash className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
