// components/bookings/view-attachment-button.tsx
"use client";

import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ViewAttachmentButtonProps {
	attachmentKey: string;
	children: React.ReactNode;
}

export function ViewAttachmentButton({
	attachmentKey,
	children,
}: ViewAttachmentButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleFileView = async () => {
		if (!attachmentKey) return;

		setIsLoading(true);
		try {
			const res = await fetch("/api/uploads/file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: attachmentKey }),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Could not get download link.");
			}

			const { url } = await res.json();
			window.open(url, "_blank"); // Open the secure link in a new tab
		} catch (error) {
			toast.error("Failed to open file.", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant="link"
			size="sm"
			className="p-0 h-auto font-medium text-indigo-600 hover:text-indigo-500"
			onClick={handleFileView}
			disabled={isLoading}
		>
			{isLoading ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<FileText className="mr-2 h-4 w-4" />
			)}
			{children}
		</Button>
	);
}
