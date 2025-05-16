"use client";

import { PaperclipIcon } from "lucide-react";
import { format } from "date-fns";

import { Separator } from "@/components/ui/separator";
import type { BookingDetail } from "@/lib/db/schema";

interface BookingOverviewProps {
	booking: BookingDetail;
}

export function BookingOverview({ booking }: BookingOverviewProps) {
	// Calculate financial summary
	// const totalReceived = booking.receivedAmounts.reduce(
	// 	(sum, payment) => sum + Number(payment.amount),
	// 	0,
	// );

	// const totalExpenses = booking.expenses.reduce(
	// 	(sum, expense) => sum + Number(expense.amount),
	// 	0,
	// );

	const packageCost = Number(booking.packageCost);
	// const pendingAmount = packageCost - totalReceived;
	// const profit = packageCost - totalExpenses;

	// // Format dates
	// const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
	// const updatedAt = booking.updatedAt ? new Date(booking.updatedAt) : null;

	return (
		<div>
			<dl className="grid grid-cols-1 sm:grid-cols-2">
				<div className=" border-gray-100 px-4 pb-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Bride Name
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.clients.brideName || "Not specified"}
					</dd>
				</div>
				<div className=" border-gray-100 px-4 pb-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Groom Name
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.clients.groomName || "Not specified"}
					</dd>
				</div>
				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Email address
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.clients.email || "Not provided"}
					</dd>
				</div>
				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Phone number
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.clients.phoneNumber || "Not provided"}
					</dd>
				</div>
				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Package Type
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.packageTypeValue}
					</dd>
				</div>
				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Package Cost
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						₹{packageCost.toLocaleString()}
					</dd>
				</div>

				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Special Instructions
					</dt>
					<dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
						{booking.note || "Not provided"}
					</dd>
				</div>
				<div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
					<dt className="text-sm font-medium leading-6 text-gray-900">
						Attachments
					</dt>
					<dd className="mt-2 text-sm text-gray-900">
						<ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
							<li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
								<div className="flex w-0 flex-1 items-center">
									<PaperclipIcon
										aria-hidden="true"
										className="h-4 w-4 flex-shrink-0 text-gray-400"
									/>
									<div className="ml-4 flex min-w-0 flex-1 gap-2">
										<span className="truncate font-medium">
											weddingtales_client_proposal.pdf
										</span>
										<span className="flex-shrink-0 text-gray-400">2.4mb</span>
									</div>
								</div>
								<div className="ml-4 flex-shrink-0">
									<a
										href="#"
										className="font-medium text-indigo-600 hover:text-indigo-500"
									>
										Download
									</a>
								</div>
							</li>
							<li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
								<div className="flex w-0 flex-1 items-center">
									<PaperclipIcon
										aria-hidden="true"
										className="h-4 w-4 flex-shrink-0 text-gray-400"
									/>
									<div className="ml-4 flex min-w-0 flex-1 gap-2">
										<span className="truncate font-medium">
											weddingtales_client_agreement.pdf
										</span>
										<span className="flex-shrink-0 text-gray-400">4.5mb</span>
									</div>
								</div>
								<div className="ml-4 flex-shrink-0">
									<a
										href="#"
										className="font-medium text-indigo-600 hover:text-indigo-500"
									>
										Download
									</a>
								</div>
							</li>
						</ul>
					</dd>
				</div>
			</dl>
		</div>
	);
}
