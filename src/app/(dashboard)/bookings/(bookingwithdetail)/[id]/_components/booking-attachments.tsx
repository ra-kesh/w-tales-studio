"use client";

import { FileText, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingDetail } from "@/types/booking";
import { ViewAttachmentButton } from "./view-attachement";

interface BookingAttachmentsProps {
	booking: BookingDetail;
}

export function BookingAttachments({ booking }: BookingAttachmentsProps) {
	const { contractAttachment, deliverablesAttachment } = booking;

	const hasAttachments = contractAttachment ?? deliverablesAttachment;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Paperclip className="h-5 w-5 text-muted-foreground" />
					<span>Attachments</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{hasAttachments ? (
					<div className="divide-y">
						{contractAttachment && (
							<div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
								<div className="flex items-center gap-4">
									<FileText className="size-6 text-muted-foreground" />
									<div>
										<div className="font-medium text-sm">Contract</div>
										<div className="text-xs text-muted-foreground">
											{contractAttachment.name}
										</div>
									</div>
								</div>
								<ViewAttachmentButton attachmentKey={contractAttachment.key}>
									View
								</ViewAttachmentButton>
							</div>
						)}
						{deliverablesAttachment && (
							<div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
								<div className="flex items-center gap-4">
									<FileText className="size-6 text-muted-foreground" />
									<div>
										<div className="font-medium text-sm">Deliverables</div>
										<div className="text-xs text-muted-foreground">
											{deliverablesAttachment.name}
										</div>
									</div>
								</div>
								<ViewAttachmentButton
									attachmentKey={deliverablesAttachment.key}
								>
									View
								</ViewAttachmentButton>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
						<Paperclip className="h-8 w-8 mb-2 opacity-50" />
						<p>No attachments have been added to this booking yet.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
