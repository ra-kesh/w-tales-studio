"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type UseFormReturn,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BookingFormValues } from "./booking-form-schema";
import { useCrews } from "@/hooks/use-crews";
import { MultiAsyncSelect } from "@/components/ui/multi-select";

interface ShootDetailFormProps {
	form: UseFormReturn<BookingFormValues>;
}

export const ShootDetailForm = () => {
	const form = useFormContext();

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
						})
					}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Shoot
				</Button>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border">
					<div className="grid grid-cols-11 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
						<div className="col-span-2">Title</div>
						<div className="col-span-2">Date</div>
						<div className="col-span-2">Time</div>
						<div className="col-span-2">Location</div>
						<div className="col-span-2">Crew</div>
					</div>

					{fields.length === 0 && (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No shoots added yet.
						</div>
					)}

					{fields.map((field, index) => (
						<div
							key={field.id}
							className="grid grid-cols-11 px-4 py-3 gap-4 relative"
						>
							<div className="col-span-2">
								<FormField
									control={form.control}
									name={`shoots.${index}.title`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input {...field} placeholder="Shoot title" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-2">
								<FormField
									control={form.control}
									name={`shoots.${index}.date`}
									render={({ field }) => (
										<FormItem>
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
											<FormControl>
												<Input type="time" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-2">
								<FormField
									control={form.control}
									name={`shoots.${index}.location`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input {...field} placeholder="Location" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-2">
								<FormField
									control={form.control}
									name={`shoots.${index}.crews`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<MultiAsyncSelect
													options={crewOptions}
													onValueChange={field.onChange}
													defaultValue={field.value}
													maxCount={5}
													placeholder="Select crew"
													searchPlaceholder="Search crew members..."
													className="w-full"
													loading={isLoading}
													async={true}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-1 flex flex-row items-center h-min">
								<Button
									variant="outline"
									className="ml-auto cursor-pointer"
									size="sm"
									onClick={() => remove(index)}
								>
									<Trash className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
