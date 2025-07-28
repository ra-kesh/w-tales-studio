// components/assignments/assignment-update-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const updateAssignmentSchema = z.object({
	status: z.string().min(1, "Please select a status"),
	comment: z.string().optional(),
	submissionLinks: z.array(z.string()).optional(),
});

type AssignmentUpdateFormData = z.infer<typeof updateAssignmentSchema>;

interface AssignmentUpdateFormProps {
	type: "task" | "deliverable";
	assignmentId: number;
	onSuccess: () => void;
}

export function AssignmentUpdateForm({
	type,
	assignmentId,
	onSuccess,
}: AssignmentUpdateFormProps) {
	const [submissionLinks, setSubmissionLinks] = useState<string[]>([]);
	const [files, setFiles] = useState<File[]>([]);

	const form = useForm<AssignmentUpdateFormData>({
		resolver: zodResolver(updateAssignmentSchema),
		defaultValues: {
			status: "",
			comment: "",
		},
	});

	const selectedStatus = form.watch("status");
	const isReadyForReview = selectedStatus === "ready_for_review";

	// Status options - you can customize this based on your business logic
	const statusOptions = [
		{ value: "in_progress", label: "In Progress" },
		{ value: "blocked", label: "Blocked" },
		{ value: "ready_for_review", label: "Ready for Review" },
	];

	const addLink = () => {
		setSubmissionLinks([...submissionLinks, ""]);
	};

	const updateLink = (index: number, value: string) => {
		const newLinks = [...submissionLinks];
		newLinks[index] = value;
		setSubmissionLinks(newLinks);
	};

	const removeLink = (index: number) => {
		setSubmissionLinks(submissionLinks.filter((_, i) => i !== index));
	};

	const onSubmit = async (data: AssignmentUpdateFormData) => {
		try {
			// TODO: Implement API call
			console.log("Updating assignment:", {
				type,
				assignmentId,
				...data,
				submissionLinks: submissionLinks.filter((link) => link.trim()),
				files,
			});

			onSuccess();
		} catch (error) {
			console.error("Failed to update assignment:", error);
		}
	};

	return (
		<div className="mt-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Status Selection */}
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select new status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Comments */}
					<FormField
						control={form.control}
						name="comment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Comments</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Add comments about this status change..."
										className="min-h-[100px]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Submission Links - Only for ready_for_review */}
					{isReadyForReview && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<FormLabel>Submission Links</FormLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addLink}
									className="gap-2"
								>
									<LinkIcon className="h-3 w-3" />
									Add Link
								</Button>
							</div>

							{submissionLinks.map((link, index) => (
								<div key={index} className="flex gap-2">
									<Input
										placeholder="https://drive.google.com/..."
										value={link}
										onChange={(e) => updateLink(index, e.target.value)}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => removeLink(index)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					)}

					{/* Submit Buttons */}
					<div className="flex gap-3 pt-6">
						<Button type="button" variant="outline" onClick={onSuccess}>
							Cancel
						</Button>
						<Button type="submit">
							Update {type === "task" ? "Task" : "Deliverable"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
