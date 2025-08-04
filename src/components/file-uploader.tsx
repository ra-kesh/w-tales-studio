// FileUploader.tsx
"use client";

import {
	File as FileIcon,
	FileImage,
	FileText,
	FileVideo,
	Loader2,
	Package,
	Pause,
	Play,
	RotateCcw,
	Trash,
	UploadCloud,
	XCircle,
} from "lucide-react";
import type React from "react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";

// Types and Interfaces
export interface FileUploadError {
	code:
		| "FILE_TOO_LARGE"
		| "TOO_MANY_FILES"
		| "INVALID_TYPE"
		| "UPLOAD_FAILED"
		| "NETWORK_ERROR"
		| "INVALID_SIGNATURE";
	message: string;
	file?: string;
}

export interface UploadedFile {
	key: string;
	name: string;
	size: number;
	url: string;
}

export interface FileToUpload {
	id: string;
	file: File;
	progress: number;
	status: "pending" | "uploading" | "success" | "error" | "paused";
	key?: string;
	source: XMLHttpRequest | null;
	uploadSpeed?: number;
	eta?: number;
	startTime?: number;
	retryCount?: number;
}

export interface FileUploaderConfig {
	maxFiles: number;
	maxFileSize: number;
	acceptedFileTypes: string[];
	retryCount: number;
	retryDelay: number;
	showProgress: boolean;
	enablePauseResume: boolean;
	validateFileSignature: boolean;
	chunkSize?: number;
}

interface FileUploaderProps {
	uploadContext:
		| "submissions"
		| "receipts"
		| "logos"
		| "contracts"
		| "deliverables";
	files: FileToUpload[];
	setFiles: React.Dispatch<React.SetStateAction<FileToUpload[]>>;
	deletingKey: string | null;
	setDeletingKey: React.Dispatch<React.SetStateAction<string | null>>;
	onUploadComplete: (files: UploadedFile[]) => void;
	onFileRemoved: (key: string) => void;
	onError?: (error: FileUploadError) => void;
	onProgressUpdate?: (file: FileToUpload, progress: number) => void;
	config?: Partial<FileUploaderConfig>;
	disabled?: boolean;
	customValidation?: (file: File) => Promise<string | null>;
	renderFilePreview?: (file: FileToUpload) => React.ReactNode;
}

// Default Configuration
const DEFAULT_CONFIG: FileUploaderConfig = {
	maxFiles: 4,
	maxFileSize: 5 * 1024 * 1024, // 5MB
	acceptedFileTypes: [
		"image/*",
		"application/pdf",
		"text/*",
		"video/*",
		"application/zip",
		"application/x-rar-compressed",
	],
	retryCount: 3,
	retryDelay: 1000,
	showProgress: true,
	enablePauseResume: true,
	validateFileSignature: true,
};

// Utility Functions
const generateFileId = (): string => {
	return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const sanitizeFileName = (fileName: string): string => {
	return fileName
		.replace(/[^a-zA-Z0-9.-]/g, "_")
		.replace(/_{2,}/g, "_")
		.substring(0, 255);
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
};

const formatUploadSpeed = (bytesPerSecond: number): string => {
	return `${formatFileSize(bytesPerSecond)}/s`;
};

const formatETA = (seconds: number): string => {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.round(seconds % 60);
	return `${minutes}m ${remainingSeconds}s`;
};

// File validation functions
const validateFileSignature = async (file: File): Promise<boolean> => {
	const buffer = await file.slice(0, 8).arrayBuffer();
	const bytes = new Uint8Array(buffer);

	const signatures: Record<string, number[][]> = {
		"image/jpeg": [[0xff, 0xd8, 0xff]],
		"image/png": [[0x89, 0x50, 0x4e, 0x47]],
		"application/pdf": [[0x25, 0x50, 0x44, 0x46]],
		"application/zip": [
			[0x50, 0x4b, 0x03, 0x04],
			[0x50, 0x4b, 0x05, 0x06],
			[0x50, 0x4b, 0x07, 0x08],
		],
	};

	const expectedSignatures = signatures[file.type];
	if (!expectedSignatures) return true; // Skip validation for unknown types

	return expectedSignatures.some((signature) =>
		signature.every((byte, index) => bytes[index] === byte),
	);
};

const validateFile = async (
	file: File,
	config: FileUploaderConfig,
	customValidation?: (file: File) => Promise<string | null>,
): Promise<FileUploadError | null> => {
	// Size validation
	if (file.size > config.maxFileSize) {
		return {
			code: "FILE_TOO_LARGE",
			message: `File "${file.name}" is larger than ${formatFileSize(config.maxFileSize)}`,
			file: file.name,
		};
	}

	// MIME type validation
	const isValidType = config.acceptedFileTypes.some((type) => {
		if (type.endsWith("/*")) {
			return file.type.startsWith(type.slice(0, -1));
		}
		return file.type === type;
	});

	if (!isValidType) {
		return {
			code: "INVALID_TYPE",
			message: `File type "${file.type}" is not supported`,
			file: file.name,
		};
	}

	// File signature validation
	if (config.validateFileSignature) {
		const isValidSignature = await validateFileSignature(file);
		if (!isValidSignature) {
			return {
				code: "INVALID_SIGNATURE",
				message: `File "${file.name}" has an invalid file signature`,
				file: file.name,
			};
		}
	}

	// Custom validation
	if (customValidation) {
		const customError = await customValidation(file);
		if (customError) {
			return {
				code: "UPLOAD_FAILED",
				message: customError,
				file: file.name,
			};
		}
	}

	return null;
};

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

// File Icon Component
const FileIconComponent = memo(({ fileName }: { fileName: string }) => {
	const extension = fileName.split(".").pop()?.toLowerCase();

	if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension!)) {
		return <FileImage className="size-5 text-gray-500" />;
	}
	if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension!)) {
		return <FileText className="size-5 text-gray-500" />;
	}
	if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension!)) {
		return <FileVideo className="size-5 text-gray-500" />;
	}
	if (["zip", "rar", "7z", "tar", "gz"].includes(extension!)) {
		return <Package className="size-5 text-gray-500" />;
	}
	return <FileIcon className="size-5 text-gray-500" />;
});

FileIconComponent.displayName = "FileIconComponent";

// File Preview Item Component
const FilePreviewItem = memo(
	({
		file,
		onRemove,
		onRetry,
		onPause,
		onResume,
		isDeleting,
		config,
	}: {
		file: FileToUpload;
		onRemove: (file: FileToUpload) => void;
		onRetry: (file: FileToUpload) => void;
		onPause: (file: FileToUpload) => void;
		onResume: (file: FileToUpload) => void;
		isDeleting: boolean;
		config: FileUploaderConfig;
	}) => {
		const showSpeedAndETA =
			file.status === "uploading" && file.uploadSpeed && file.eta;

		return (
			<div
				className="flex items-center p-2 space-x-2 bg-white border rounded-md shadow-sm col-span-1 lg:col-span-2"
				data-testid="file-preview-item"
				data-file-status={file.status}
			>
				<div className="flex-shrink-0">
					<FileIconComponent fileName={file.file.name} />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-semibold truncate" title={file.file.name}>
						{file.file.name}
					</p>
					{/* <p className="text-xs text-gray-400">
						{formatFileSize(file.file.size)}
					</p> */}
					{config.showProgress && (
						<div className="flex items-center gap-2 mt-1">
							<div className="w-full bg-gray-200 rounded-full h-1.5">
								<div
									className={`h-1.5 rounded-full transition-all duration-300 ${
										file.status === "error"
											? "bg-red-500"
											: file.status === "success"
												? "bg-green-500"
												: file.status === "paused"
													? "bg-yellow-500"
													: "bg-primary"
									}`}
									style={{ width: `${file.progress}%` }}
									role="progressbar"
									aria-valuenow={file.progress}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label={`Upload progress: ${file.progress}%`}
								/>
							</div>
							<span className="text-xs text-gray-500 min-w-[35px]">
								{file.progress}%
							</span>
						</div>
					)}
					{showSpeedAndETA && (
						<div className="flex justify-between text-xs text-gray-400 mt-1">
							<span>{formatUploadSpeed(file.uploadSpeed!)}</span>
							<span>ETA: {formatETA(file.eta!)}</span>
						</div>
					)}
				</div>

				<div className="flex gap-1">
					{file.status === "error" && (
						<>
							<Button
								size="sm"
								variant="outline"
								onClick={() => onRetry(file)}
								disabled={isDeleting}
								aria-label={`Retry upload for ${file.file.name}`}
							>
								<RotateCcw className="size-4" />
							</Button>
							<XCircle
								className="size-4 text-red-500"
								aria-label="Upload failed"
							/>
						</>
					)}

					{file.status === "uploading" && config.enablePauseResume && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => onPause(file)}
							aria-label={`Pause upload for ${file.file.name}`}
						>
							<Pause className="size-4" />
						</Button>
					)}

					{file.status === "paused" && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => onResume(file)}
							aria-label={`Resume upload for ${file.file.name}`}
						>
							<Play className="size-4" />
						</Button>
					)}

					{(file.status === "success" ||
						file.status === "error" ||
						file.status === "paused") && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => onRemove(file)}
							disabled={isDeleting}
							aria-label={`Remove ${file.file.name}`}
						>
							{isDeleting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Trash className="size-4" />
							)}
						</Button>
					)}
				</div>
			</div>
		);
	},
);

FilePreviewItem.displayName = "FilePreviewItem";

// Main FileUploader Component
export function FileUploader({
	uploadContext,
	files,
	setFiles,
	deletingKey,
	setDeletingKey,
	onUploadComplete,
	onFileRemoved,
	onError,
	onProgressUpdate,
	config: userConfig = {},
	disabled = false,
	customValidation,
	renderFilePreview,
}: FileUploaderProps) {
	const config = useMemo(
		() => ({ ...DEFAULT_CONFIG, ...userConfig }),
		[userConfig],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.source) {
					file.source.abort();
				}
			});
		};
	}, []);

	// Debounced progress update
	const debouncedProgressUpdate = useMemo(
		() =>
			debounce((file: FileToUpload, progress: number) => {
				onProgressUpdate?.(file, progress);
			}, 100),
		[onProgressUpdate],
	);

	const updateFileState = useCallback(
		(fileId: string, updates: Partial<FileToUpload>) => {
			setFiles((prev) =>
				prev.map((f) => {
					if (f.id === fileId) {
						const updated = { ...f, ...updates };
						if (updates.progress !== undefined) {
							debouncedProgressUpdate(updated, updates.progress);
						}
						return updated;
					}
					return f;
				}),
			);
		},
		[setFiles, debouncedProgressUpdate],
	);

	const uploadFileWithRetry = useCallback(
		async (fileToUpload: FileToUpload, retryCount = 0) => {
			try {
				const startTime = Date.now();
				updateFileState(fileToUpload.id, {
					status: "uploading",
					startTime,
					retryCount,
				});

				const response = await fetch("/api/uploads/presigned-url", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName: sanitizeFileName(fileToUpload.file.name),
						fileType: fileToUpload.file.type,
						context: uploadContext,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const { url, key } = await response.json();
				updateFileState(fileToUpload.id, { key });

				const xhr = new XMLHttpRequest();
				updateFileState(fileToUpload.id, { source: xhr });

				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", fileToUpload.file.type);

				let lastLoaded = 0;
				let lastTime = startTime;

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						const currentTime = Date.now();
						const timeDiff = (currentTime - lastTime) / 1000; // seconds
						const bytesDiff = event.loaded - lastLoaded;

						if (timeDiff > 0) {
							const uploadSpeed = bytesDiff / timeDiff;
							const eta = (event.total - event.loaded) / uploadSpeed;

							updateFileState(fileToUpload.id, {
								progress,
								uploadSpeed,
								eta,
							});

							lastLoaded = event.loaded;
							lastTime = currentTime;
						} else {
							updateFileState(fileToUpload.id, { progress });
						}
					}
				};

				xhr.onload = () => {
					if (xhr.status === 200) {
						updateFileState(fileToUpload.id, {
							progress: 100,
							status: "success",
							uploadSpeed: undefined,
							eta: undefined,
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
						throw new Error(`Upload failed with status ${xhr.status}`);
					}
				};

				xhr.onerror = () => {
					throw new Error("Network error during upload");
				};

				xhr.send(fileToUpload.file);
			} catch (error) {
				if (retryCount < config.retryCount) {
					const delay = config.retryDelay * 2 ** retryCount;
					setTimeout(() => {
						uploadFileWithRetry(fileToUpload, retryCount + 1);
					}, delay);
				} else {
					updateFileState(fileToUpload.id, { status: "error" });
					const uploadError: FileUploadError = {
						code: "UPLOAD_FAILED",
						message: `Failed to upload ${fileToUpload.file.name} after ${config.retryCount} attempts`,
						file: fileToUpload.file.name,
					};
					onError?.(uploadError);
					toast.error("Upload Failed", {
						description: uploadError.message,
					});
				}
			}
		},
		[uploadContext, updateFileState, onUploadComplete, onError, config],
	);

	const onDrop = useCallback(
		async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
			// Handle file rejections
			fileRejections.forEach(({ file, errors }) => {
				errors.forEach((error) => {
					const uploadError: FileUploadError = {
						code:
							error.code === "file-too-large"
								? "FILE_TOO_LARGE"
								: error.code === "too-many-files"
									? "TOO_MANY_FILES"
									: "UPLOAD_FAILED",
						message: error.message,
						file: file.name,
					};
					onError?.(uploadError);
					toast.error(uploadError.message);
				});
			});

			// Check total file count
			const currentAndNewFiles = [...files, ...acceptedFiles];
			if (currentAndNewFiles.length > config.maxFiles) {
				const error: FileUploadError = {
					code: "TOO_MANY_FILES",
					message: `You can only upload a maximum of ${config.maxFiles} files in total.`,
				};
				onError?.(error);
				toast.error(error.message);
				return;
			}

			// Validate each file
			const validatedFiles: FileToUpload[] = [];
			for (const file of acceptedFiles) {
				const validationError = await validateFile(
					file,
					config,
					customValidation,
				);
				if (validationError) {
					onError?.(validationError);
					toast.error(validationError.message);
					continue;
				}

				validatedFiles.push({
					id: generateFileId(),
					file,
					progress: 0,
					status: "pending",
					source: null,
					retryCount: 0,
				});
			}

			if (validatedFiles.length > 0) {
				setFiles((prev) => [...prev, ...validatedFiles]);
				validatedFiles.forEach((file) => uploadFileWithRetry(file));
			}
		},
		[files, setFiles, config, onError, customValidation, uploadFileWithRetry],
	);

	const removeFile = useCallback(
		async (fileToRemove: FileToUpload) => {
			if (fileToRemove.source) {
				fileToRemove.source.abort();
			}

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
				} catch (error) {
					toast.error("Error removing file from storage.");
				} finally {
					setDeletingKey(null);
				}
			}

			setFiles((prev) => prev.filter((f) => f.id !== fileToRemove.id));
		},
		[setDeletingKey, setFiles, onFileRemoved],
	);

	const retryFile = useCallback(
		(fileToRetry: FileToUpload) => {
			updateFileState(fileToRetry.id, {
				status: "pending",
				progress: 0,
				source: null,
				uploadSpeed: undefined,
				eta: undefined,
				retryCount: 0,
			});
			uploadFileWithRetry(fileToRetry);
		},
		[updateFileState, uploadFileWithRetry],
	);

	const pauseFile = useCallback(
		(fileToPause: FileToUpload) => {
			if (fileToPause.source) {
				fileToPause.source.abort();
				updateFileState(fileToPause.id, {
					status: "paused",
					source: null,
					uploadSpeed: undefined,
					eta: undefined,
				});
			}
		},
		[updateFileState],
	);

	const resumeFile = useCallback(
		(fileToResume: FileToUpload) => {
			updateFileState(fileToResume.id, { status: "pending" });
			uploadFileWithRetry(fileToResume);
		},
		[updateFileState, uploadFileWithRetry],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: config.maxFiles,
		maxSize: config.maxFileSize,
		accept: config.acceptedFileTypes.reduce(
			(acc, type) => {
				acc[type] = [];
				return acc;
			},
			{} as Record<string, string[]>,
		),
		disabled,
	});

	const maxFileSizeMB = Math.round(config.maxFileSize / (1024 * 1024));

	return (
		<div
			className="space-y-3"
			data-testid="file-uploader"
			data-upload-context={uploadContext}
		>
			<div
				{...getRootProps()}
				className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50/50 transition-colors ${
					isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
				} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-label="Upload files by dragging and dropping or clicking to browse"
				aria-disabled={disabled}
				data-testid="file-dropzone"
				onKeyDown={(e) => {
					if ((e.key === "Enter" || e.key === " ") && !disabled) {
						e.preventDefault();
						// The dropzone handles this automatically
					}
				}}
			>
				<input {...getInputProps()} />
				<UploadCloud className="size-6 text-gray-500" aria-hidden="true" />
				<p className="mt-2 text-sm text-gray-600">
					{isDragActive
						? "Drop the files here..."
						: "Drag & drop files here, or click to select"}
				</p>
				<p className="text-xs text-gray-400 mt-1">
					Up to {config.maxFiles} files, {maxFileSizeMB}MB each
				</p>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{files.some((f) => f.status === "uploading") &&
					`Uploading ${files.filter((f) => f.status === "uploading").length} files`}
				{files.some((f) => f.status === "success") &&
					`${files.filter((f) => f.status === "success").length} files uploaded successfully`}
				{files.some((f) => f.status === "error") &&
					`${files.filter((f) => f.status === "error").length} files failed to upload`}
			</div>

			{files.length > 0 && (
				<div className="space-y-2" data-testid="file-preview-list">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
						{files.map((item) =>
							renderFilePreview ? (
								renderFilePreview(item)
							) : (
								<FilePreviewItem
									key={item.id}
									file={item}
									onRemove={removeFile}
									onRetry={retryFile}
									onPause={pauseFile}
									onResume={resumeFile}
									isDeleting={deletingKey === item.key}
									config={config}
								/>
							),
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// Export utilities for testing
export const FileUploaderTestUtils = {
	createMockFile: (name: string, size: number, type: string): File => {
		return new File([""], name, { type, lastModified: Date.now() });
	},

	createMockFileToUpload: (file: File): FileToUpload => ({
		id: generateFileId(),
		file,
		progress: 0,
		status: "pending",
		source: null,
		retryCount: 0,
	}),

	DEFAULT_CONFIG,
	validateFile,
	sanitizeFileName,
	formatFileSize,
};

export default FileUploader;
