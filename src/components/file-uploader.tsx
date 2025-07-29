"use client";

import {
	CheckCircle2,
	File as FileIcon,
	UploadCloud,
	XCircle,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// These interfaces remain the same
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
	source: XMLHttpRequest | null;
}

// The props are now generic
interface FileUploaderProps {
	uploadContext: "submissions" | "receipts" | "logos";
	onUploadComplete: (files: UploadedFile[]) => void;
}

export function FileUploader({
	uploadContext,
	onUploadComplete,
}: FileUploaderProps) {
	const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const newFiles = acceptedFiles.map((file) => ({
				file,
				progress: 0,
				status: "pending" as const,
				source: null,
			}));
			setFilesToUpload((prev) => [...prev, ...newFiles]);
			newFiles.forEach(uploadFile);
		},
		[uploadContext],
	); // Depend on uploadContext

	const uploadFile = (fileToUpload: FileToUpload) => {
		// Pass the context to the API
		fetch("/api/uploads/presigned-url", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				fileName: fileToUpload.file.name,
				fileType: fileToUpload.file.type,
				context: uploadContext, // <-- The crucial change
			}),
		})
			.then((res) => res.json())
			.then(({ url, key }) => {
				// The rest of the upload logic is identical
				const xhr = new XMLHttpRequest();
				fileToUpload.source = xhr;
				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", fileToUpload.file.type);
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						updateFileProgress(fileToUpload.file, progress, "uploading");
					}
				};
				xhr.onload = () => {
					if (xhr.status === 200) {
						updateFileProgress(fileToUpload.file, 100, "success");
						const finalUrl = url.split("?")[0];
						onUploadComplete([
							{
								key,
								name: fileToUpload.file.name,
								size: fileToUpload.file.size,
								url: finalUrl,
							},
						]);
					} else {
						updateFileProgress(fileToUpload.file, 0, "error");
					}
				};
				xhr.onerror = () => {
					updateFileProgress(fileToUpload.file, 0, "error");
				};
				xhr.send(fileToUpload.file);
			})
			.catch(() => {
				updateFileProgress(fileToUpload.file, 0, "error");
			});
	};

	const updateFileProgress = (
		file: File,
		progress: number,
		status: FileToUpload["status"],
	) => {
		setFilesToUpload((prev) =>
			prev.map((f) => (f.file === file ? { ...f, progress, status } : f)),
		);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		// You can add mime type restrictions here if needed for a specific use-case
		// accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }
	});

	// The JSX remains the same
	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
					isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
				}`}
			>
				<input {...getInputProps()} />
				<UploadCloud className="w-10 h-10 text-gray-500" />
				<p className="mt-2 text-sm text-gray-600">
					{isDragActive
						? "Drop the files here ..."
						: "Drag 'n' drop some files here, or click to select files"}
				</p>
			</div>
			{filesToUpload.length > 0 && (
				<div className="space-y-2">
					{filesToUpload.map(({ file, progress, status }, index) => (
						<div
							key={index}
							className="flex items-center p-2 border rounded-lg"
						>
							<FileIcon className="w-6 h-6 text-gray-500" />
							<div className="flex-1 ml-3">
								<p className="text-sm font-medium">{file.name}</p>
								<div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
									<div
										className={`h-1.5 rounded-full ${
											status === "error" ? "bg-red-500" : "bg-blue-500"
										}`}
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>
							<div className="ml-3">
								{status === "success" && (
									<CheckCircle2 className="w-5 h-5 text-green-500" />
								)}
								{status === "error" && (
									<XCircle className="w-5 h-5 text-red-500" />
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
