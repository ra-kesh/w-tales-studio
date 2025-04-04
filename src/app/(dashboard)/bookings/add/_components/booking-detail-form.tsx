"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOpts, RelationTypes } from "./booking-form-schema";
import { useBookingTypes, usePackageTypes } from "@/hooks/use-configs";
import { useStore } from "@tanstack/react-form";

export const BookingDetailForm = withForm({
	...formOpts,
	render: ({ form }) => {
		const { data: packageTypes = [] } = usePackageTypes();
		const { data: bookingTypes = [] } = useBookingTypes();

		const bookingType = useStore(
			form.store,
			(state) => state.values?.bookingType ?? "WEDDING",
		);

		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Booking Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 lg:grid-cols-5">
							<div className="col-span-2">
								<form.AppField
									name="bookingName"
									children={(field) => (
										<field.TextField label="Booking name" required />
									)}
								/>
							</div>

							<form.AppField
								name="bookingType"
								children={(field) => (
									<field.SelectField
										label="Booking Type"
										options={bookingTypes}
										className="w-full"
									/>
								)}
							/>
							<form.AppField
								name="packageType"
								listeners={{
									onChange: async ({ value }) => {
										const selectedPackage = packageTypes.find(
											(pkg) => pkg.value === value,
										);
										if (selectedPackage?.metadata) {
											// Set package cost
											form.setFieldValue(
												"packageCost",
												selectedPackage.metadata.defaultCost as string,
											);

											// Set default deliverables if they exist
											if (
												selectedPackage.metadata.defaultDeliverables?.length > 0
											) {
												const formattedDeliverables =
													selectedPackage.metadata.defaultDeliverables.map(
														(del) => ({
															title: del.title,
															cost: "0",
															quantity: del.quantity ?? 1,
															dueDate: "",
														}),
													);
												form.setFieldValue(
													"deliverables",
													formattedDeliverables.map((del) => ({
														...del,
														quantity: String(del.quantity),
													})),
												);
											} else {
												form.setFieldValue("deliverables", []);
											}
										} else {
											form.setFieldValue("packageCost", "");
											form.setFieldValue("deliverables", []);
										}
									},
								}}
								children={(field) => (
									<field.SelectField
										label="Package Type"
										options={packageTypes}
										className="w-full"
									/>
								)}
							/>

							<form.AppField
								name="packageCost"
								children={(field) => (
									<field.PriceField
										label="Package cost"
										placeholder="0.00"
										required
									/>
								)}
							/>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Client Detail</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							{bookingType === "COMMERCIAL" && (
								<>
									<form.AppField
										name="clientName"
										children={(field) => (
											<field.TextField label="Client name" required />
										)}
									/>
									<form.AppField
										name="companyName"
										children={(field) => (
											<field.TextField label="Company name" required />
										)}
									/>
								</>
							)}

							{bookingType === "WEDDING" && (
								<>
									<form.AppField
										name="brideName"
										children={(field) => (
											<field.TextField label="Bride name" required />
										)}
									/>
									<form.AppField
										name="groomName"
										children={(field) => (
											<field.TextField label="Groom name" required />
										)}
									/>

									<form.AppField
										name="pocName"
										children={(field) => (
											<field.TextField label="Point of Contact" required />
										)}
									/>

									<form.AppField
										name="relation"
										children={(field) => (
											<field.SelectField
												label="Relation"
												options={RelationTypes}
												className="w-full"
											/>
										)}
									/>
								</>
							)}

							<form.AppField
								name="phone"
								children={(field) => (
									<field.TextField
										label="Phone Number"
										type="tel"
										// pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
										required
										placeholder="+91 xxxxxxxxxx"
									/>
								)}
							/>
							<form.AppField
								name="email"
								children={(field) => (
									<field.TextField
										label="Email"
										type="email"
										placeholder="client@example.com"
									/>
								)}
							/>
						</div>
					</CardContent>
				</Card>
			</>
		);
	},
});
