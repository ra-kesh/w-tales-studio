"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useReviewSubmissionMutation } from "@/hooks/use-submission-mutation";

const reviewSchema = z.object({
	action: z.enum(["approve", "request_changes"], {
		error: "You must select an action.",
	}),
	reviewComment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewSubmissionDialogProps {
	submissionId: number;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

export function ReviewSubmissionDialog({
	submissionId,
	isOpen,
	onOpenChange,
}: ReviewSubmissionDialogProps) {
	const reviewMutation = useReviewSubmissionMutation();
	const form = useForm<ReviewFormData>({
		resolver: zodResolver(reviewSchema),
	});

	const onSubmit = (data: ReviewFormData) => {
		reviewMutation.mutate(
			{ submissionId, ...data },
			{
				onSuccess: () => {
					onOpenChange(false);
					form.reset();
				},
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Review Submission</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="action"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Action</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											className="flex gap-4"
										>
											<FormItem className="flex items-center space-x-2">
												<FormControl>
													<RadioGroupItem value="approve" />
												</FormControl>
												<FormLabel className="font-normal">Approve</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-2">
												<FormControl>
													<RadioGroupItem value="request_changes" />
												</FormControl>
												<FormLabel className="font-normal">
													Request Changes
												</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="reviewComment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Feedback / Comments</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Provide feedback for the crew member..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={reviewMutation.isPending}>
								{reviewMutation.isPending ? "Submitting..." : "Submit Review"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
