"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";

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

	// const { data: teamData } = useTeam();
	const teamMembers = [];

	const [equipment, setEquipment] = useState<string[]>(
		defaultValues.equipment || [],
	);
	const equipmentRef = useRef<HTMLInputElement>(null);

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
									<FormLabel>Select Team Member</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													// biome-ignore lint/a11y/useSemanticElements: <explanation>
													role="combobox"
													className={cn(
														"w-full justify-between",
														!field.value && "text-muted-foreground",
													)}
												>
													{field.value
														? teamMembers.find(
																(member) => member.id === field.value,
															)?.user.name || "Select team member"
														: "Select team member"}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search team members..." />
												<CommandList>
													<ScrollArea className="h-64">
														<CommandEmpty>No team member found.</CommandEmpty>
														<CommandGroup>
															{teamMembers.map((member) => (
																<CommandItem
																	key={member.id}
																	value={member.id}
																	onSelect={() => {
																		form.setValue("memberId", member.id, {
																			shouldValidate: true,
																		});
																		// Pre-fill email if available
																		if (member.user.email) {
																			form.setValue("email", member.user.email);
																		}
																		// Clear name when selecting a member
																		form.setValue("name", "");
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			field.value === member.id
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{member.user.name}
																</CommandItem>
															))}
														</CommandGroup>
													</ScrollArea>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
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
											onChange={(e) => {
												field.onChange(e);
												// Clear memberId when entering external name
												if (e.target.value) {
													form.setValue("memberId", "");
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-1">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Enter email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-1">
						<FormField
							control={form.control}
							name="phoneNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input placeholder="Enter phone number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-2">
						<FormField
							control={form.control}
							name="specialization"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Specialization</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Photographer, Videographer"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-1">
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<FormControl>
										<Input placeholder="e.g. Lead, Assistant" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-1">
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<FormControl>
										<select
											className={cn(
												"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
											)}
											{...field}
										>
											<option value="available">Available</option>
											<option value="unavailable">Unavailable</option>
											<option value="on-leave">On Leave</option>
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="col-span-2">
						<FormLabel>Equipment</FormLabel>
						<div className="flex flex-wrap gap-2 mb-2">
							{equipment.map((item, index) => (
								<Badge key={index} variant="secondary">
									{item}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
										onClick={() => {
											const newEquipment = equipment.filter(
												(_, i) => i !== index,
											);
											setEquipment(newEquipment);
											form.setValue("equipment", newEquipment);
										}}
									>
										<X className="h-3 w-3" />
									</Button>
								</Badge>
							))}
						</div>
						<div className="flex gap-2">
							<Input
								ref={equipmentRef}
								placeholder="Add equipment (e.g. Camera, Lens)"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										const value = equipmentRef.current?.value.trim();
										if (value) {
											const newEquipment = [...equipment, value];
											setEquipment(newEquipment);
											form.setValue("equipment", newEquipment);
											equipmentRef.current.value = "";
										}
									}
								}}
							/>
							<Button
								type="button"
								size="icon"
								onClick={() => {
									const value = equipmentRef.current?.value.trim();
									if (value) {
										const newEquipment = [...equipment, value];
										setEquipment(newEquipment);
										form.setValue("equipment", newEquipment);
										equipmentRef.current.value = "";
									}
								}}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={!form.formState.isValid || form.formState.isSubmitting}
				>
					{form.formState.isSubmitting
						? mode === "create"
							? "Creating..."
							: "Updating..."
						: mode === "create"
							? "Create Crew Member"
							: "Update Crew Member"}
				</Button>
			</form>
		</Form>
	);
}
