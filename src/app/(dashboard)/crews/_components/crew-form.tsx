"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	CrewSchema,
	type CrewFormValues,
	defaultCrew,
} from "./crew-form-schema";
import { useOrganizationMembers } from "@/hooks/use-members";

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

	const {
		data: members = [],
		isLoading: isLoadingMembers,
		error: membersError,
	} = useOrganizationMembers();

	const getSelectedMemberName = (memberId: string | undefined) => {
		if (!memberId) return "Select team member";
		const member = members.find((m) => m.memberId === memberId);
		return member?.userName || "Select team member";
	};

	const handleAddEquipment = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const value = formData.get("newEquipment")?.toString().trim();

		if (value) {
			form.setValue("equipment", [...equipment, value], {
				shouldValidate: true,
			});
			(e.target as HTMLFormElement).reset();
		}
	};

	const handleRemoveEquipment = (index: number) => {
		const newEquipment = equipment.filter((_, i) => i !== index);
		form.setValue("equipment", newEquipment, {
			shouldValidate: true,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
				<div className="grid grid-cols-2 gap-6">
					<div className="col-span-2">
						<FormField
							control={form.control}
							name="memberId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Select Team Member (Optional)</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													// biome-ignore lint/a11y/useSemanticElements: <explanation>
													role="combobox"
													disabled={isLoadingMembers || !!membersError}
													className={cn(
														"w-full justify-between",
														!field.value && "text-muted-foreground",
													)}
												>
													{isLoadingMembers ? (
														<span className="flex items-center">
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
															Loading...
														</span>
													) : membersError ? (
														"Error loading members"
													) : (
														getSelectedMemberName(field.value)
													)}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
											<Command>
												<CommandInput placeholder="Search team members..." />
												<CommandList>
													<ScrollArea className="h-64">
														<CommandEmpty>No team member found.</CommandEmpty>
														<CommandGroup>
															<CommandItem
																key="clear-selection"
																value=""
																onSelect={() => {
																	form.setValue("memberId", "", {
																		shouldValidate: true,
																	});
																	form.setValue("email", "");
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		!field.value ? "opacity-100" : "opacity-0",
																	)}
																/>
																-- None (External Crew) --
															</CommandItem>

															{members.map((member) => (
																<CommandItem
																	key={member.memberId}
																	value={member.memberId}
																	onSelect={() => {
																		form.setValue("memberId", member.memberId, {
																			shouldValidate: true,
																		});

																		if (member.userEmail) {
																			form.setValue("email", member.userEmail);
																		} else {
																			form.setValue("email", "");
																		}

																		form.setValue("name", "");
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			field.value === member.memberId
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{member.userName ||
																		`User (${member.userId.substring(
																			0,
																			6,
																		)}...)`}
																</CommandItem>
															))}
														</CommandGroup>
													</ScrollArea>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{membersError && (
										<p className="text-sm text-red-600 mt-1">
											{membersError.message}
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>External Crew Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter name for external crew member"
											{...field}
											disabled={!!form.watch("memberId")}
										/>
									</FormControl>
									<FormDescription>
										Required if no team member is selected.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="crew@example.com"
										{...field}
										disabled={!!form.watch("memberId")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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

					<FormField
						control={form.control}
						name="role"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Role</FormLabel>
								<FormControl>
									<Input placeholder="e.g. Lead Photographer" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="specialization"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Specialization</FormLabel>
								<FormControl>
									<Input placeholder="e.g. Candid, Drone" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="col-span-2 space-y-4">
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

				<div className="flex justify-end space-x-2">
					<Button type="button" variant="outline">
						Cancel
					</Button>
					<Button type="submit" disabled={form.formState.isSubmitting}>
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
