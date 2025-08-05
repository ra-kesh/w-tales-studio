"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentUploader } from "@/app/(dashboard)/bookings/_components/booking-form/attachment-uploader";
import { convertScheduleFormSchema, type ConvertScheduleFormValues } from "./convert-schedule-form-schema";
import { useConvertScheduleMutation } from "@/hooks/use-convert-schedule-mutation";

interface ConvertScheduleSheetProps {
	schedule: {
		id: number;
		amount: string;
	};
}

export function ConvertScheduleSheet({ schedule }: ConvertScheduleSheetProps) {
	const form = useForm<ConvertScheduleFormValues>({
		resolver: zodResolver(convertScheduleFormSchema),
		defaultValues: {
			amount: schedule.amount,
			paidOn: new Date().toISOString().split("T")[0],
		},
	});

	const convertMutation = useConvertScheduleMutation();

	const onSubmit = async (data: ConvertScheduleFormValues) => {
		await convertMutation.mutateAsync({ id: schedule.id, data });
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Mark as Paid</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Convert to Received Payment</SheetTitle>
					<SheetDescription>
						Fill in the details to convert this scheduled payment to a received payment.
					</SheetDescription>
				</SheetHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-8">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount Received</FormLabel>
									<FormControl>
										<Input type="number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="paidOn"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date Paid</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="attachment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Attachment</FormLabel>
									<FormControl>
										<AttachmentUploader name="attachment" uploadContext="receipts" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={convertMutation.isPending}>
							{convertMutation.isPending ? "Converting..." : "Convert"}
						</Button>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
