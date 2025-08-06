"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookingTypes, usePackageTypes } from "@/hooks/use-configs";
import { AttachmentUploader } from "./attachment-uploader";
import {
	type BookingEditFormValues,
	BookingEditSchema,
} from "./booking-edit-form-schema";
import type { UploadedAttachment } from "./booking-form-schema";

interface BookingEditFormProps {
	booking: {
		bookingType: string;
		packageType: string;
		bookingName: string;
		packageCost: string;
		status:
			| "new"
			| "preparation"
			| "shooting"
			| "delivery"
			| "completed"
			| "cancelled";
		note?: string | null;
		contractAttachment?: UploadedAttachment | null;
		deliverablesAttachment?: UploadedAttachment | null;
	};
	onSubmit: (data: BookingEditFormValues) => Promise<void>;
}

export function BookingEditForm({ booking, onSubmit }: BookingEditFormProps) {
	const form = useForm<BookingEditFormValues>({
		resolver: zodResolver(BookingEditSchema),
		defaultValues: {
			bookingName: booking.bookingName,
			packageCost: booking.packageCost,
			status: booking.status,
			note: booking.note ?? "",
			contractAttachment: booking.contractAttachment ?? null,
			deliverablesAttachment: booking.deliverablesAttachment ?? null,
		},
		mode: "onChange",
	});

	const { data: bookingTypes = [] } = useBookingTypes();
	const { data: packageTypes = [] } = usePackageTypes();

	const bookingTypeLabel =
		bookingTypes.find((t) => t.value === booking.bookingType)?.label ||
		booking.bookingType;
	const packageTypeLabel =
		packageTypes.find((p) => p.value === booking.packageType)?.label ||
		booking.packageType;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-6 gap-6 px-4"
			>
				<div className="col-span-4">
					<FormField
						control={form.control}
						name="bookingName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Booking Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="col-span-2">
					<FormItem>
						<FormLabel>Booking Type</FormLabel>
						<Select value={booking.bookingType} disabled>
							<SelectTrigger className="w-full">
								{bookingTypeLabel}
							</SelectTrigger>
						</Select>
					</FormItem>
				</div>

				<div className="col-span-3">
					<FormItem>
						<FormLabel>Package Type</FormLabel>
						<Select value={booking.packageType} disabled>
							<SelectTrigger className="w-full">
								{packageTypeLabel}
							</SelectTrigger>
						</Select>
					</FormItem>
				</div>
				<div className="col-span-3">
					<FormField
						control={form.control}
						name="packageCost"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Package Cost</FormLabel>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
										₹
									</span>
									<Input className="pl-7" {...field} />
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-6">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Booking Stage</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="new">New</SelectItem>
										<SelectItem value="preparation">Preparation</SelectItem>
										<SelectItem value="shooting">Shooting</SelectItem>
										<SelectItem value="delivery">Delivery</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-6">
					<FormField
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notes</FormLabel>
								<FormControl>
									<Textarea placeholder="Add any additional notes" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-6">
					<FormField
						control={form.control}
						name="contractAttachment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Contract</FormLabel>
								<FormControl>
									<AttachmentUploader
										name="contractAttachment"
										uploadContext="contracts"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-6">
					<FormField
						control={form.control}
						name="deliverablesAttachment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Deliverables</FormLabel>
								<FormControl>
									<AttachmentUploader
										name="deliverablesAttachment"
										uploadContext="deliverables"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="col-span-6">
					<Button
						className="w-full font-semibold cursor-pointer"
						type="submit"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
