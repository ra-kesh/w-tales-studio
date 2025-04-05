"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withForm } from "@/components/form";
import { formOpts } from "./booking-form-schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export const ShootDetailForm = withForm({
	...formOpts,
	render: ({ form }) => {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Shoots</CardTitle>
					{/* <Button size="sm" variant="outline">
						<Plus className="mr-2 h-4 w-4" />
						Add Shoot
					</Button> */}
				</CardHeader>
				<CardContent>
					<form.Field name="shoots" mode="array">
						{(field) => {
							return (
								<>
									<div className="rounded-md border">
										<div className="grid grid-cols-10 border-b bg-muted/50 px-4 py-3 text-sm font-medium gap-4">
											<div className="col-span-3">Title</div>
											<div className="col-span-2">Date</div>
											<div className="col-span-2">Time</div>
											<div className="col-span-2">Location</div>
										</div>

										{field.state.value.length === 0 && (
											<div className="p-4 text-center text-sm text-muted-foreground">
												No shoots added yet.
											</div>
										)}

										{field.state.value.map((_, i) => {
											return (
												<div
													key={i}
													className="grid grid-cols-10 px-4 py-3 gap-4 relative"
												>
													<div className="col-span-3">
														<form.AppField
															name={`shoots[${i}].title`}
															children={(subField) => <subField.TextField />}
														/>
													</div>

													<div className="col-span-2">
														<form.AppField
															name={`shoots[${i}].date`}
															children={(subField) => <subField.DateField />}
														/>
													</div>

													<div className="col-span-2">
														<form.AppField
															name={`shoots[${i}].time`}
															children={(subField) => (
																<subField.TimeField placeholder="Pick a time" />
															)}
														/>
													</div>
													<div className="col-span-2">
														<form.AppField
															name={`shoots[${i}].location`}
															children={(subField) => <subField.TextField />}
														/>
													</div>

													<Button
														variant={"outline"}
														className="ml-auto cursor-pointer mt-1.5"
														size="sm"
														onClick={() => field.removeValue(i)}
													>
														<Trash className="h-4 w-4" />
													</Button>
												</div>
											);
										})}
									</div>
									<Button
										size="sm"
										type="button"
										variant="outline"
										className="mt-4"
										onClick={() =>
											field.pushValue({
												title: "",
												date: "",
												time: "",
												location: "",
											})
										}
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Shoot
									</Button>
								</>
							);
						}}
					</form.Field>
				</CardContent>
			</Card>
		);
	},
});
