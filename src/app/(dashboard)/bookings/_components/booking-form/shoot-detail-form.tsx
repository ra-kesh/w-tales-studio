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
import { useCrews } from "@/hooks/use-crews";
import type { BookingFormValues } from "./booking-form-schema";

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
							time: "00:00",
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
				<div className="space-y-6">
					{fields.length === 0 && (
						<div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
							No shoots added yet. Click "Add Shoot" to get started.
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
								<div className="col-span-4">
									<FormField
										control={form.control}
										name={`shoots.${index}.title`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Shoot title" />
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
								<div className="col-span-12">
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
														async={true}
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
