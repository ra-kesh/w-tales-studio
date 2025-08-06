"use client";

import { Plus, Trash } from "lucide-react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AttachmentUploader } from "./attachment-uploader";

export function BookingDeliveryForm() {
	const { control } = useFormContext();

	const { fields, append, remove } = useFieldArray({
		control,
		name: "deliverables",
	});

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Deliverables Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<FormField
						control={control}
						name="deliverablesAttachment"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<AttachmentUploader
										name="deliverablesAttachment"
										uploadContext="deliverables" // Or a more specific context
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
			<Card className="mb-6">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Deliverables</CardTitle>
					<Button
						size="sm"
						type="button"
						variant="outline"
						onClick={() =>
							append({
								title: "",
								cost: "0",
								quantity: "1",
								dueDate: "",
							})
						}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Deliverables
					</Button>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
							<div className="col-span-3">Title</div>
							<div className="col-span-2">Extra Cost</div>
							<div className="col-span-2">Quantity</div>
							<div className="col-span-2">Due Date</div>
						</div>

						{fields.length === 0 && (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No deliverables added yet.
							</div>
						)}

						{fields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-10 px-4 py-3 gap-4 relative"
							>
								<div className="col-span-3">
									<FormField
										control={control}
										name={`deliverables.${index}.title`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Deliverable title" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<FormField
										control={control}
										name={`deliverables.${index}.cost`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="number"
														placeholder="0.00"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<FormField
										control={control}
										name={`deliverables.${index}.quantity`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="number"
														placeholder="1"
														{...field}
														onChange={(e) => field.onChange(e.target.value)}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<FormField
										control={control}
										name={`deliverables.${index}.dueDate`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<Button
									variant="outline"
									className="ml-auto cursor-pointer mt-1.5"
									size="sm"
									onClick={() => remove(index)}
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
