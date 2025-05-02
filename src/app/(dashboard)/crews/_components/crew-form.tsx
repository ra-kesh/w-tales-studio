"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { SheetClose } from "@/components/ui/sheet";
import { useCrewForm } from "@/hooks/use-crew-form";
import type { Crew } from "@/lib/db/schema";

interface CrewFormProps {
	crew?: Crew;
	onSuccess?: () => void;
}

export function CrewForm({ crew, onSuccess }: CrewFormProps) {
	const { form, onSubmit, isPending } = useCrewForm({ crew, onSuccess });

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="John Doe" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="john@example.com" {...field} />
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
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="photographer">Photographer</SelectItem>
									<SelectItem value="videographer">Videographer</SelectItem>
									<SelectItem value="assistant">Assistant</SelectItem>
									<SelectItem value="editor">Editor</SelectItem>
									<SelectItem value="makeup">Makeup Artist</SelectItem>
								</SelectContent>
							</Select>
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
								<Input placeholder="Wedding Photography" {...field} />
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
								<Input placeholder="+1234567890" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select availability status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="available">Available</SelectItem>
									<SelectItem value="unavailable">Unavailable</SelectItem>
									<SelectItem value="on-leave">On Leave</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="equipment"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Equipment</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Camera bodies, lenses, etc. (comma separated)"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end gap-4">
					<SheetClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</SheetClose>
					<Button type="submit" disabled={isPending}>
						{crew ? "Update" : "Create"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
