"use client";

import { type ChangeEvent, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
	value: string;
	onChange: (value: string) => void;
	accept?: string;
	maxSize?: number;
}

export function ImageUpload({
	value,
	onChange,
	accept = "image/*",
	maxSize = 5000000,
}: ImageUploadProps) {
	const [preview, setPreview] = useState("");

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > maxSize) {
			alert(`File size should be less than ${maxSize / 1000000}MB`);
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result as string;
			setPreview(result);
			onChange(result);
		};
		reader.readAsDataURL(file);
	};

	const handleRemove = () => {
		setPreview("");
		onChange("");
	};

	return (
		<div className="space-y-4">
			<Input
				type="file"
				accept={accept}
				onChange={handleChange}
				className="hidden"
				id="image-upload"
			/>
			{preview ? (
				<div className="relative aspect-video w-full overflow-hidden rounded-lg border">
					<Image
						src={preview}
						alt="Upload preview"
						fill
						className="object-cover"
					/>
					<Button
						variant="destructive"
						size="icon"
						className="absolute right-2 top-2"
						onClick={handleRemove}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<label
					htmlFor="image-upload"
					className="flex aspect-video w-full cursor-pointer items-center justify-center rounded-lg border border-dashed"
				>
					<div className="flex flex-col items-center gap-2">
						<ImagePlus className="h-8 w-8 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							Click to upload image
						</span>
					</div>
				</label>
			)}
		</div>
	);
}
