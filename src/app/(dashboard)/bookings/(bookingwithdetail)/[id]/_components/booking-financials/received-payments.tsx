// components/bookings/received-payments.tsx (Refactored)
"use client";

import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import type { ReceivedAmountWithAttachment } from "@/types/booking"; // <-- Import the correct type
import { ViewAttachmentButton } from "../view-attachement";

interface ReceivedPaymentsProps {
	receivedAmounts: ReceivedAmountWithAttachment[]; // <-- Use the enriched type
}

export function ReceivedPayments({ receivedAmounts }: ReceivedPaymentsProps) {
	const { setParams } = usePaymentsParams();

	if (!receivedAmounts.length) {
		return (
			<div className="text-sm text-muted-foreground py-4 text-center">
				No payments received yet
			</div>
		);
	}

	// Grouping logic remains the same
	const groupedPayments = receivedAmounts.reduce(
		(acc, payment) => {
			const paidDate = payment.paidOn
				? new Date(payment.paidOn as string)
				: null;
			const dateKey = paidDate ? format(paidDate, "yyyy-MM-dd") : "No Date";
			const displayDate = paidDate
				? format(paidDate, "MMMM d, yyyy")
				: "No Date";

			if (!acc[dateKey]) {
				acc[dateKey] = { date: displayDate, dateTime: dateKey, payments: [] };
			}
			acc[dateKey].payments.push(payment);
			return acc;
		},
		{} as Record<
			string,
			{
				date: string;
				dateTime: string;
				payments: ReceivedAmountWithAttachment[];
			}
		>,
	);

	const sortedDates = Object.values(groupedPayments).sort((a, b) =>
		b.dateTime.localeCompare(a.dateTime),
	);

	return (
		<div className="overflow-hidden">
			<table className="w-full text-left px-4 sm:px-6 lg:px-8">
				<thead className="sr-only">
					<tr>
						<th>Amount</th>
						<th className="hidden sm:table-cell">Description</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{sortedDates.map((day) => (
						<Fragment key={day.dateTime}>
							<tr className="text-sm leading-6 text-gray-900">
								<th
									scope="colgroup"
									colSpan={3}
									className="relative isolate py-2 font-semibold px-4"
								>
									<time dateTime={day.dateTime}>{day.date}</time>
									<div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
									<div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
								</th>
							</tr>
							{day.payments.map((payment) => (
								<tr key={payment.id}>
									<td className="relative py-5 px-4">
										<div className="flex gap-x-6">
											<div className="flex-auto">
												<div className="flex items-start gap-x-3">
													<div className="text-sm font-medium leading-6 text-gray-900">
														₹{Number(payment.amount).toLocaleString()}
													</div>
													<div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
														Received
													</div>
												</div>
											</div>
										</div>
										<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
										<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
									</td>
									<td className="hidden py-5 px-4 sm:table-cell">
										<div className="text-sm leading-6 text-gray-900">
											{(payment.description as string) || "Payment"}
										</div>
									</td>
									<td className="py-5 px-4 text-right">
										<div className="flex justify-end items-center gap-4">
											{payment.attachment ? (
												<ViewAttachmentButton
													attachmentKey={payment.attachment.key}
												>
													View
												</ViewAttachmentButton>
											) : (
												<span className="text-xs text-muted-foreground">
													No Attachment
												</span>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 rounded-full hover:bg-gray-100"
												onClick={() =>
													setParams({
														receivedPaymentId: payment.id.toString(),
													})
												}
											>
												<Edit className="h-3.5 w-3.5 text-gray-500" />
												<span className="sr-only">Edit received payment</span>
											</Button>
										</div>
									</td>
								</tr>
							))}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}
