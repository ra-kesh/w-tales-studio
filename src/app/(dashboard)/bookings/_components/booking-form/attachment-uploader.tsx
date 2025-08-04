// components/bookings/attachment-uploader.tsx (Final Refactored Version)
"use client";

import { Loader2, Trash2 } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	FileUpload,
	type FileUploadProps,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import type { UploadedAttachment } from "./booking-form-schema";

interface AttachmentUploaderProps {
	name: string;
	uploadContext: "contracts" | "receipts" | "submissions" | "logos";
}

export function AttachmentUploader({
	name,
	uploadContext,
}: AttachmentUploaderProps) {
	const { watch, setValue } = useFormContext();
	// The attachment is now our clean, flat metadata object or null
	const attachment: UploadedAttachment | null = watch(name);

	const [isUploading, setIsUploading] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);

	const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
		async (files, { onSuccess, onError }) => {
			const file = files[0];
			if (!file) return;

			setIsUploading(true);
			try {
				const presignedUrlRes = await fetch("/api/uploads/presigned-url", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName: file.name,
						fileType: file.type,
						context: uploadContext,
					}),
				});

				if (!presignedUrlRes.ok)
					throw new Error("Failed to get an upload URL.");
				const { url, key } = await presignedUrlRes.json();

				const uploadRes = await fetch(url, {
					method: "PUT",
					body: file,
					headers: { "Content-Type": file.type },
				});

				if (uploadRes.ok) {
					const finalUrl = url.split("?")[0];
					// --- THE FIX: Set the new, flat metadata object in the form state ---
					setValue(
						name,
						{
							name: file.name,
							size: file.size,
							type: file.type,
							key: key,
							url: finalUrl,
						},
						{ shouldValidate: true },
					);
					onSuccess(file);
				} else {
					onError(file, new Error("Upload to storage failed."));
				}
			} catch (error) {
				onError(
					file,
					error instanceof Error ? error : new Error("Upload failed"),
				);
			} finally {
				setIsUploading(false);
			}
		},
		[setValue, name, uploadContext],
	);

	const handleRemove = async () => {
		if (!attachment) return;
		setIsDeleting(true);
		try {
			await fetch("/api/uploads/file", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: attachment.key }),
			});
			setValue(name, null, { shouldValidate: true });
			toast.success("Attachment removed.");
		} catch (error) {
			toast.error("Failed to remove attachment.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<FileUpload
			onUpload={onUpload}
			onFileReject={(file, message) =>
				toast.error(message, { description: file.name })
			}
			// The value prop is only for the library's internal list management,
			// which we are not using. We can pass an empty array.
			value={[]}
			maxFiles={1}
			className="min-w-0"
		>
			<div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
				<span className="truncate pr-3 text-muted-foreground">
					{isUploading && "Uploading..."}
					{!isUploading && (attachment?.name ?? "No file selected")}
				</span>

				{isUploading ? (
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				) : attachment ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7 -mr-2"
						onClick={handleRemove}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Trash2 className="size-4 text-red-500" />
						)}
						<span className="sr-only">Remove file</span>
					</Button>
				) : (
					<FileUploadTrigger asChild>
						<Button type="button" variant="outline" size="sm" className="h-7">
							Browse
						</Button>
					</FileUploadTrigger>
				)}
			</div>
		</FileUpload>
	);
}
