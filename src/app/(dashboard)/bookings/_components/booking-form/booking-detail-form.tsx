"use client";

import React, { useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { BookingFormValues } from "./booking-form-schema";
import { useBookingTypes, usePackageTypes } from "@/hooks/use-configs";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DivideCircle, Plus, Trash2 } from "lucide-react";

export const BookingDetailForm = () => {
	const form = useFormContext<BookingFormValues>();
	const { data: bookingTypes = [] } = useBookingTypes();
	const { data: packageTypes = [] } = usePackageTypes();

	const bookingType = form.watch("bookingType");

	type RoleOption = { value: string; label: string };

	type RolesByBookingType = {
		[key: string]: RoleOption[];
		wedding: RoleOption[];
		"pre-wedding": RoleOption[];
		engagement: RoleOption[];
		maternity: RoleOption[];
		"b-day": RoleOption[];
		"baby shoot": RoleOption[];
		commercial: RoleOption[];
		corporate: RoleOption[];
		default: RoleOption[];
	};

	const rolesByBookingType: RolesByBookingType = useMemo(
		() => ({
			wedding: [
				{ value: "bride", label: "Bride" },
				{ value: "groom", label: "Groom" },
				{ value: "family", label: "Family" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],
			"pre-wedding": [
				{ value: "bride", label: "Bride" },
				{ value: "groom", label: "Groom" },
				{ value: "family", label: "Family" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],
			engagement: [
				{ value: "bride", label: "Bride" },
				{ value: "groom", label: "Groom" },
				{ value: "family", label: "Family" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],

			maternity: [
				{ value: "mother", label: "Mother" },
				{ value: "partner", label: "Partner" },
				{ value: "family", label: "Family" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],

			"b-day": [
				{ value: "birthday_person", label: "Birthday Person" },
				{ value: "host", label: "Host" },
				{ value: "family", label: "Family" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],

			"baby shoot": [
				{ value: "baby", label: "Baby" },
				{ value: "parent", label: "Parent" },
				{ value: "sibling", label: "Sibling" },
				{ value: "family", label: "Family" },
				{ value: "other", label: "Other" },
			],

			commercial: [
				{ value: "brand", label: "Brand" },
				{ value: "contact", label: "Point of Contact" },
				{ value: "agency", label: "Agency" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],

			corporate: [
				{ value: "company", label: "Company" },
				{ value: "contact", label: "Point of Contact" },
				{ value: "team", label: "Team" },
				{ value: "planner", label: "Planner" },
				{ value: "other", label: "Other" },
			],

			default: [{ value: "other", label: "Other" }],
		}),
		[],
	);

	const roleOptions =
		rolesByBookingType[bookingType.toLowerCase()] ?? rolesByBookingType.default;

	const {
		fields: participants,
		append,
		remove,
	} = useFieldArray({
		control: form.control,
		name: "participants",
	});

	return (
		<>
			{/* ——— Booking Details ——— */}
			<Card>
				<CardHeader>
					<CardTitle>Booking Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 lg:grid-cols-5">
						<div className="col-span-2">
							<FormField
								control={form.control}
								name="bookingName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Booking Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="col-span-1">
							<FormField
								control={form.control}
								name="bookingType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Booking Type</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger className="min-w-full">
													<SelectValue placeholder="Select booking type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{bookingTypes.map((t) => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
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
								name="packageType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Package Type</FormLabel>
										<Select
											onValueChange={(val) => {
												field.onChange(val);
												const selected = packageTypes.find(
													(p) => p.value === val,
												);
												if (selected?.metadata) {
													form.setValue(
														"packageCost",
														selected.metadata.defaultCost ?? "",
													);
													if (selected.metadata.defaultDeliverables?.length) {
														form.setValue(
															"deliverables",
															selected.metadata.defaultDeliverables.map(
																(d) => ({
																	title: d.title,
																	cost: "0.00",
																	quantity: String(d.quantity ?? 1),
																	dueDate: "",
																}),
															),
														);
													} else {
														form.setValue("deliverables", []);
													}
												} else {
													form.setValue("packageCost", "");
													form.setValue("deliverables", []);
												}
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="min-w-full max-w-full">
													<SelectValue placeholder="Select package" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{packageTypes.map((p) => (
													<SelectItem key={p.value} value={p.value}>
														{p.label}
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
								name="packageCost"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Package Cost</FormLabel>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												₹
											</span>
											<Input className="pl-7" {...field} />
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ——— Participants ——— */}
			<Card className="gap-3">
				<CardHeader className="flex items-center justify-between">
					<CardTitle>Client Details</CardTitle>
					<Button
						size="sm"
						variant={"outline"}
						type="button"
						className="ml-auto"
						onClick={() =>
							append({
								name: "",
								role: "",
								phone: "",
								email: "",
								address: "",
								metadata: {},
							})
						}
					>
						<Plus className="mr-2 h-4 w-4" /> Add Client
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{participants.map((field, index) => (
						<Card key={field.id} className="py-0 gap-0 divide-y-1 ">
							<CardHeader className="flex justify-between items-center py-1 px-4 bg-muted/50">
								<CardTitle className="text-sm">Client {index + 1}</CardTitle>
								<Button
									disabled={index <= 0}
									variant="ghost"
									size="icon"
									onClick={() => remove(index)}
									aria-label="Remove participant"
								>
									<Trash2 className="w-4 h-4 text-red-500" />
								</Button>
							</CardHeader>

							<CardContent className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
								<div className="md:col-span-8 grid grid-cols-8 gap-4">
									<div className="col-span-5">
										<FormField
											control={form.control}
											name={`participants.${index}.name`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Name</FormLabel>
													<FormControl>
														<Input placeholder="Full name" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="col-span-3">
										<FormField
											control={form.control}
											name={`participants.${index}.role`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Role</FormLabel>
													<FormControl>
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<SelectTrigger className="w-full">
																<SelectValue placeholder="Select role" />
															</SelectTrigger>
															<SelectContent>
																{roleOptions.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="col-span-4">
										<FormField
											control={form.control}
											name={`participants.${index}.phone`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Phone</FormLabel>
													<FormControl>
														<Input
															type="tel"
															placeholder="+91 xxxxxxxxxx"
															{...field}
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
											name={`participants.${index}.email`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input
															type="email"
															placeholder="you@example.com"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className="md:col-span-4 flex">
									<FormField
										control={form.control}
										name={`participants.${index}.address`}
										render={({ field }) => (
											<FormItem className="flex h-full flex-col w-full">
												<FormLabel>Address</FormLabel>
												<FormControl className="flex-1">
													<Textarea
														placeholder="Address"
														{...field}
														className="h-full"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					))}
				</CardContent>
			</Card>
		</>
	);
};
