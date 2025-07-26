"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type CrewFormValues,
	CrewSchema,
	defaultCrew,
} from "./crew-form-schema";

interface CrewFormProps {
	defaultValues?: CrewFormValues;
	onSubmit: (data: CrewFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

export function CrewForm({
	defaultValues = defaultCrew,
	onSubmit,
	mode = "create",
}: CrewFormProps) {
	const form = useForm<CrewFormValues>({
		resolver: zodResolver(CrewSchema),
		defaultValues,
		mode: "onChange",
	});

	const equipment = form.watch("equipment") || [];

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
				<div className="grid grid-cols-6 gap-6">
					<div className="col-span-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Crew Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., John Doe" {...field} />
									</FormControl>
									{/* <FormDescription>
										The name of the external crew member or freelancer.
									</FormDescription> */}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="col-span-2">
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="min-w-full">
												<SelectValue placeholder="Crew status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="available">Available</SelectItem>
											<SelectItem value="unavailable">Unavailable</SelectItem>
										</SelectContent>
									</Select>
									{/* <FormDescription>
										Crew member's current availability.
									</FormDescription> */}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-3">
						<FormField
							control={form.control}
							name="phoneNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input placeholder="+1 234 567 890" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-3">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="crew@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-6">
						<FormField
							control={form.control}
							name="specialization"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Specialization</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Cinematographer,Drone operator"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-6 space-y-4">
						<div className="flex items-center justify-between">
							<FormLabel>Equipment</FormLabel>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									form.setValue("equipment", [...equipment, ""], {
										shouldValidate: true,
									});
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Equipment
							</Button>
						</div>

						<div className="space-y-4">
							{equipment.map((_, index) => (
								<div key={index} className="flex items-center gap-2">
									<FormField
										control={form.control}
										name={`equipment.${index}`}
										render={({ field }) => (
											<FormItem className="flex-grow">
												<FormControl>
													<Input {...field} placeholder="Equipment item" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											form.setValue(
												"equipment",
												equipment.filter((_, i) => i !== index),
												{ shouldValidate: true },
											);
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="col-span-6 mt-4">
					{/* <Button type="button" variant="outline">
						Cancel
					</Button> */}
					<Button
						className="min-w-full"
						type="submit"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
							</>
						) : mode === "create" ? (
							"Create Crew"
						) : (
							"Save Changes"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
