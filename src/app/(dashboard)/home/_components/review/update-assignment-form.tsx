// components/assignments/assignment-update-form.tsx (Final Version)
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FileUploader, type UploadedFile } from "@/components/file-uploader";
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
	submissionLinks: z
		.array(
			z.object({
				value: z
					.union([
						z.url({ message: "Please enter a valid URL." }),
						z.literal(""),
					])
					.optional(),
			}),
		)
		.optional(),
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
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

	const form = useForm<AssignmentUpdateFormData>({
		resolver: zodResolver(updateAssignmentSchema),
		defaultValues: {
			status: "",
			comment: "",
			submissionLinks: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "submissionLinks",
	});

	const selectedStatus = form.watch("status");
	const isReadyForReview = selectedStatus === "ready_for_review";

	useEffect(() => {
		if (isReadyForReview && fields.length === 0) {
			append({ value: "" });
		}
	}, [isReadyForReview, fields.length, append]);

	const handleUploadComplete = (newFiles: UploadedFile[]) => {
		setUploadedFiles((prev) => [...prev, ...newFiles]);
	};

	const handleFileRemoved = (key: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file.key !== key));
	};

	const onSubmit = async (data: AssignmentUpdateFormData) => {
		try {
			const payload = {
				assignmentType: type,
				status: data.status,
				comment: data.comment,
				submissionLinks: data.submissionLinks
					?.map((link) => link.value)
					.filter((link) => link && link.trim()),
				files: uploadedFiles,
				...(type === "task"
					? { taskId: assignmentId }
					: { deliverableId: assignmentId }),
			};

			const response = await fetch("/api/submissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Submission failed");
			}

			toast.success("Assignment updated successfully!");
			onSuccess();
		} catch (error) {
			toast.error("Update Failed", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred.",
			});
		}
	};

	const statusOptions = [
		{ value: "in_progress", label: "In Progress" },
		{ value: "blocked", label: "Blocked" },
		{ value: "ready_for_review", label: "Ready for Review" },
	];

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-6 gap-6 px-4"
			>
				<div className="col-span-6">
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
										<SelectTrigger className="min-w-full">
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
				</div>

				<div className="col-span-6">
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
				</div>

				{isReadyForReview && (
					<div className="col-span-6 space-y-3">
						<div className="flex items-center justify-between">
							<FormLabel>Submission Links</FormLabel>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => append({ value: "" })}
							>
								<LinkIcon className="h-3 w-3" />
								Add Link
							</Button>
						</div>

						{fields.map((field, index) => (
							<FormField
								key={field.id}
								control={form.control}
								name={`submissionLinks.${index}.value`}
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormControl>
												<Input
													placeholder="e.g https://drive.google.com/..."
													{...field}
												/>
											</FormControl>
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={() => remove(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</div>
				)}

				{isReadyForReview && (
					<div className="col-span-6 space-y-3">
						<FormLabel>Proof of Work</FormLabel>
						<FileUploader
							uploadContext="submissions"
							onUploadComplete={handleUploadComplete}
							onFileRemoved={handleFileRemoved}
						/>
					</div>
				)}
				<div className="col-span-6 mt-6">
					<Button
						type="submit"
						className="min-w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting
							? type === "task"
								? "Upadating Task..."
								: "Updating Deliverable..."
							: `Update ${type === "task" ? "Task" : "Deliverable"}`}
					</Button>
				</div>
			</form>
		</Form>
	);
}
