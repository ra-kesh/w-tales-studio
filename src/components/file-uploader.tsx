"use client";

import {
	File as FileIcon,
	FileImage,
	FileText,
	FileVideo,
	Loader2,
	Package,
	Trash,
	UploadCloud,
	XCircle,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";

const MAX_FILES = 4;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadedFile {
	key: string;
	name: string;
	size: number;
	url: string;
}
interface FileToUpload {
	file: File;
	progress: number;
	status: "pending" | "uploading" | "success" | "error";
	key?: string;
	source: XMLHttpRequest | null;
}
interface FileUploaderProps {
	uploadContext: "submissions" | "receipts" | "logos";
	onUploadComplete: (files: UploadedFile[]) => void;
	onFileRemoved: (key: string) => void;
}

// --- Helper Function for Icons (Unchanged) ---
const getFileIcon = (fileName: string) => {
	const extension = fileName.split(".").pop()?.toLowerCase();
	if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension!)) {
		return <FileImage className="size-5 text-gray-500" />;
	}
	if (["pdf", "doc", "docx", "txt"].includes(extension!)) {
		return <FileText className="size-5 text-gray-500" />;
	}
	if (["mp4", "mov", "avi", "mkv"].includes(extension!)) {
		return <FileVideo className="size-5 text-gray-500" />;
	}
	if (["zip", "rar", "7z"].includes(extension!)) {
		return <Package className="size-5 text-gray-500" />;
	}
	return <FileIcon className="size-5 text-gray-500" />;
};

export function FileUploader({
	uploadContext,
	onUploadComplete,
	onFileRemoved,
}: FileUploaderProps) {
	const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
	const [deletingKey, setDeletingKey] = useState<string | null>(null);

	const onDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			fileRejections.forEach(({ file, errors }) => {
				if (errors[0].code === "file-too-large") {
					toast.error("File too large", {
						description: `${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`,
					});
				}
				if (errors[0].code === "too-many-files") {
					toast.error("Too many files", {
						description: `You can only upload a maximum of ${MAX_FILES} files.`,
					});
				}
			});
			const currentAndNewFiles = [...filesToUpload, ...acceptedFiles];
			if (currentAndNewFiles.length > MAX_FILES) {
				toast.error("Too many files", {
					description: `You can only upload a maximum of ${MAX_FILES} files in total.`,
				});
				return;
			}
			const newFiles = acceptedFiles.map((file) => ({
				file,
				progress: 0,
				status: "pending" as const,
				source: null,
			}));
			setFilesToUpload((prev) => [...prev, ...newFiles]);
			newFiles.forEach(uploadFile);
		},
		[uploadContext, filesToUpload],
	);

	const uploadFile = (fileToUpload: FileToUpload) => {
		fetch("/api/uploads/presigned-url", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				fileName: fileToUpload.file.name,
				fileType: fileToUpload.file.type,
				context: uploadContext,
			}),
		})
			.then((res) => res.json())
			.then(({ url, key }) => {
				updateFileState(fileToUpload.file, { key });
				const xhr = new XMLHttpRequest();
				fileToUpload.source = xhr;
				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", fileToUpload.file.type);
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						updateFileState(fileToUpload.file, {
							progress,
							status: "uploading",
						});
					}
				};
				xhr.onload = () => {
					if (xhr.status === 200) {
						updateFileState(fileToUpload.file, {
							progress: 100,
							status: "success",
						});
						const finalUrl = url.split("?")[0];
						onUploadComplete([
							{
								key,
								name: fileToUpload.file.name,
								size: fileToUpload.file.size,
								url: finalUrl,
							},
						]);
						toast.success("File uploaded", {
							description: fileToUpload.file.name,
						});
					} else {
						updateFileState(fileToUpload.file, { status: "error" });
						toast.error("Upload Failed", {
							description: `Could not upload ${fileToUpload.file.name}.`,
						});
					}
				};
				xhr.onerror = () => {
					updateFileState(fileToUpload.file, { status: "error" });
					toast.error("Network Error", {
						description: `Could not upload ${fileToUpload.file.name}.`,
					});
				};
				xhr.send(fileToUpload.file);
			})
			.catch(() => {
				updateFileState(fileToUpload.file, { status: "error" });
				toast.error("Upload Failed", {
					description: `Could not get an upload URL for ${fileToUpload.file.name}.`,
				});
			});
	};

	const updateFileState = (file: File, updates: Partial<FileToUpload>) => {
		setFilesToUpload((prev) =>
			prev.map((f) => (f.file === file ? { ...f, ...updates } : f)),
		);
	};

	const removeFile = async (fileToRemove: FileToUpload) => {
		if (fileToRemove.source) fileToRemove.source.abort();

		if (fileToRemove.status === "success" && fileToRemove.key) {
			setDeletingKey(fileToRemove.key);
			try {
				await fetch("/api/uploads/file", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ key: fileToRemove.key }),
				});
				onFileRemoved(fileToRemove.key);
				toast.success("File removed successfully.");
				setFilesToUpload((prev) =>
					prev.filter((f) => f.key !== fileToRemove.key),
				);
			} catch (error) {
				toast.error("Error removing file from storage.");
			} finally {
				setDeletingKey(null);
			}
		} else {
			setFilesToUpload((prev) =>
				prev.filter((f) => f.file !== fileToRemove.file),
			);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: MAX_FILES,
		maxSize: MAX_FILE_SIZE_BYTES,
	});

	return (
		<div className="space-y-3">
			<div
				{...getRootProps()}
				className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50/50 ${
					isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
				}`}
			>
				<input {...getInputProps()} />
				<UploadCloud className="size-6 text-gray-500" />
				<p className="mt-2 text-sm text-gray-600">
					{isDragActive
						? "Drop the files here..."
						: "Drag & drop files here, or click to select"}
				</p>
				<p className="text-xs text-gray-400 mt-1">
					Up to {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each
				</p>
			</div>

			{filesToUpload.length > 0 && (
				<div className="space-y-2">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
						{filesToUpload.map((item, index) => (
							<div
								key={index}
								className=" flex items-center p-2 space-x-2 bg-white border rounded-md shadow-sm col-span-1 lg:col-span-2 "
							>
								<div className="flex-shrink-0">
									{getFileIcon(item.file.name)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold truncate">
										{item.file.name}
									</p>
									<div className="flex items-center gap-2">
										<div className="w-full bg-gray-200 rounded-full h-1.5">
											<div
												className={`h-1.5 rounded-full transition-all duration-300 ${
													item.status === "error" ? "bg-red-500" : "bg-primary"
												}`}
												style={{ width: `${item.progress}%` }}
											/>
										</div>
									</div>
								</div>

								{item.status === "success" && (
									<Button
										size={"sm"}
										variant={"outline"}
										onClick={() => removeFile(item)}
										disabled={deletingKey === item.key}
									>
										{deletingKey === item.key ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash className="size-4" />
										)}
									</Button>
								)}
								{item.status === "error" && (
									<XCircle className="inline-block size-4 text-red-500" />
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
