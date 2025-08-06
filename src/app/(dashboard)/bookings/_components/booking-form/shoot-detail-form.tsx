"use client";

import { Plus, Trash } from "lucide-react";
import React from "react";
import {
	type UseFormReturn,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiAsyncSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useCrews } from "@/hooks/use-crews";
import type { BookingFormValues } from "./booking-form-schema";

interface ShootDetailFormProps {
	form: UseFormReturn<BookingFormValues>;
}

export const ShootDetailForm = () => {
	const form = useFormContext();

	const additionalServicesOptions = [
		{ label: "Drone Service", value: "drone_service" },
	];

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "shoots",
	});

	const { data: crewData, isLoading } = useCrews();
	const crewOptions = React.useMemo(() => {
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
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Shoots</CardTitle>
				<Button
					size="sm"
					type="button"
					variant="outline"
					onClick={() =>
						append({
							title: "",
							date: "",
							time: "",
							location: "",
							crews: [],
							notes: "",
							additionalDetails: {
								additionalServices: [],
								requiredCrewCount: "",
							},
						})
					}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Shoot
				</Button>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{fields.length === 0 && (
						<div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
							No shoots added yet. Click &quot;Add Shoot&quot; to get started.
						</div>
					)}
					{fields.map((field, index) => (
						<div
							key={field.id}
							className="border rounded-md p-4 relative space-y-4"
						>
							<Button
								variant="outline"
								className="absolute top-2 right-2 cursor-pointer text-muted-foreground hover:text-destructive"
								size="icon"
								onClick={() => remove(index)}
							>
								<Trash className="h-4 w-4" />
							</Button>

							<div className="grid grid-cols-12 gap-4 pt-6">
								<div className="col-span-8 grid-cols-8 grid gap-4">
									<div className="col-span-6">
										<FormField
											control={form.control}
											name={`shoots.${index}.title`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Event</FormLabel>
													<FormControl>
														<Input {...field} placeholder="Event name" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="col-span-2">
										<FormField
											control={form.control}
											name={`shoots.${index}.additionalDetails.requiredCrewCount`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>No. of Crews</FormLabel>
													<FormControl>
														<Input {...field} placeholder="e.g 3" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="col-span-4 grid grid-cols-4 gap-4">
									<div className="col-span-2">
										<FormField
											control={form.control}
											name={`shoots.${index}.date`}
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
									<div className="col-span-2">
										<FormField
											control={form.control}
											name={`shoots.${index}.time`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Time</FormLabel>
													<FormControl>
														<Input type="time" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className="col-span-8">
									<FormField
										control={form.control}
										name={`shoots.${index}.crews`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Crew</FormLabel>
												<FormControl>
													<MultiAsyncSelect
														options={crewOptions}
														onValueChange={field.onChange}
														defaultValue={field.value}
														maxCount={5}
														placeholder="Select crew members"
														searchPlaceholder="Search crew..."
														className="w-full"
														loading={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="col-span-4">
									<FormField
										control={form.control}
										name={`shoots.${index}.additionalDetails.additionalServices`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Extra Services</FormLabel>
												<FormControl>
													<MultiAsyncSelect
														options={additionalServicesOptions}
														onValueChange={field.onChange}
														defaultValue={field.value}
														placeholder="Select extra services"
														searchPlaceholder="Search services..."
														className="w-full"
														loading={false}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-8">
									<FormField
										control={form.control}
										name={`shoots.${index}.notes`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Notes</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Any additional shoot specific request"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-4">
									<FormField
										control={form.control}
										name={`shoots.${index}.location`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Location</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Google map location preferably"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
