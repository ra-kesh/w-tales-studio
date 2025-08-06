"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { AttachmentUploader } from "@/app/(dashboard)/bookings/_components/booking-form/attachment-uploader";
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
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useConvertScheduleMutation } from "@/hooks/use-convert-schedule-mutation";
import {
	type ConvertScheduleFormValues,
	convertScheduleFormSchema,
} from "./convert-schedule-form-schema";

interface ConvertScheduleSheetProps {
	schedule: {
		id: number;
		amount: string;
	};
	children: React.ReactNode;
}

export function ConvertScheduleSheet({
	schedule,
	children,
}: ConvertScheduleSheetProps) {
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
			<SheetTrigger asChild>{children}</SheetTrigger>

			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">
						Convert to received payment
					</SheetTitle>
					<SheetClose>
						<XIcon className="size-4" />
					</SheetClose>
				</SheetHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-2 gap-6 px-4"
					>
						<div className="col-span-2">
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
						</div>
						<div className="col-span-2">
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
						</div>
						<div className="col-span-2">
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="col-span-2">
							<FormField
								control={form.control}
								name="attachment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Attachment</FormLabel>
										<FormControl>
											<AttachmentUploader
												name="attachment"
												uploadContext="receipts"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="col-span-2 mt-6">
							<Button
								type="submit"
								disabled={convertMutation.isPending}
								className="min-w-full"
							>
								{convertMutation.isPending ? "Converting..." : "Convert"}
							</Button>
						</div>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
