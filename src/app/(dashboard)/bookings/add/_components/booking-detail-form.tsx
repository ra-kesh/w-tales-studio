"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOpts, RelationTypes } from "./booking-form-schema";
import { useBookingTypes, usePackageTypes } from "@/hooks/use-configs";

export const BookingDetailForm = withForm({
	...formOpts,
	render: ({ form }) => {
		const { data: packageTypes = [] } = usePackageTypes();
		const { data: bookingTypes = [] } = useBookingTypes();

		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Booking Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<form.AppField
								name="bookingName"
								children={(field) => (
									<field.TextField label="Booking name" required />
								)}
							/>

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
								// listeners={{
								// 	onChange: async ({ value, fieldApi }) => {
								// 		const cost = await fetchPackageCost(value);
								// 		fieldApi.form.setFieldValue("packageCost", cost.toFixed(2));
								// 	},
								// }}
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
						<CardTitle>Client Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<form.AppField
								name="clientName"
								children={(field) => (
									<field.TextField label="Client name" required />
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

							<form.AppField
								name="phone"
								children={(field) => (
									<field.TextField
										label="Phone number"
										type="tel"
										pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
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
