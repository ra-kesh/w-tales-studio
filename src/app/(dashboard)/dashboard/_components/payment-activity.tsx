"use client";

import { Fragment, useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";

import { cn } from "@/lib/utils";
import { ArrowDownCircleIcon } from "lucide-react";
import type { DashboardData } from "@/hooks/use-dashboard";
import Link from "next/link";

const formatCurrency = (value: string | number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number(value));
};

const getInitials = (name: string) => {
	const names = name.split(" ");
	if (names.length > 1) {
		return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
};

const formatDateHeader = (dateStr: string) => {
	const date = new Date(dateStr);
	if (isToday(date)) return "Today";
	if (isYesterday(date)) return "Yesterday";
	return format(date, "MMMM d, yyyy");
};

// --- Main Component ---
export function PayementsAndClients({
	bookingAnalytics,
}: {
	bookingAnalytics: DashboardData["bookingAnalytics"];
}) {
	const { recentClients, recentPayments } = bookingAnalytics;

	const groupedPayments = useMemo(() => {
		return recentPayments.reduce(
			(
				acc: {
					[key: string]: {
						id: number;
						amount: number;
						paidOn: string;
						bookingName: string;
					}[];
				},
				payment,
			) => {
				if (!payment.paidOn) return acc; // Skip payments with no date

				// Get the date part only (e.g., "2025-06-20")
				const dateKey = payment.paidOn.split("T")[0];

				if (!acc[dateKey]) {
					acc[dateKey] = [];
				}
				acc[dateKey].push(payment);
				return acc;
			},
			{},
		);
	}, [recentPayments]);

	const paymentStatusStyle = "text-green-700 bg-green-50 ring-green-600/20";

	return (
		<div className="space-y-6">
			<div className="mx-auto ">
				<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
					<div className="flex items-center justify-between">
						<h2 className="text-base/7 font-semibold text-gray-900">
							Recent Clients
						</h2>
						<Link
							prefetch
							href="/clients"
							className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
						>
							View all<span className="sr-only">, clients</span>
						</Link>
					</div>

					<ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 lg:grid-cols-3 xl:gap-x-4">
						{recentClients.map((client) => (
							<li
								key={client.id}
								className="overflow-hidden rounded-xl border border-gray-200"
							>
								<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-4">
									<div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-white object-cover text-lg font-bold text-gray-700 ring-1 ring-gray-900/10">
										{getInitials(client.name)}
									</div>
									<div className="text-sm/6 font-medium text-gray-900">
										{client.name}
									</div>
								</div>
								<dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm/6">
									<div className="flex justify-between gap-x-4 py-3">
										<dt className="text-gray-500">Phone</dt>
										<dd className="text-gray-700">{client.phoneNumber}</dd>
									</div>
									<div className="flex justify-between gap-x-4 py-3">
										<dt className="text-gray-500">Email</dt>
										<dd className="text-gray-700">{client.email}</dd>
									</div>
								</dl>
							</li>
						))}
					</ul>
					{/* <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 lg:grid-cols-3 xl:gap-x-4">
						{recentClients.map((client) => (
							<li
								key={client.id}
								className="overflow-hidden rounded-xl border border-gray-200"
							>
								<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-4">
									<div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-white object-cover text-lg font-bold text-gray-700 ring-1 ring-gray-900/10">
										{client.brideName?.charAt(0) + client.groomName?.charAt(0)}
									</div>
									<div className="text-sm/6 font-medium text-gray-900">
										{client.brideName} & {client.groomName}
									</div>
								</div>
								<dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm/6">
									<div className="flex justify-between gap-x-4 py-3">
										<dt className="text-gray-500">Phone</dt>
										<dd className="text-gray-700">{client.phoneNumber}</dd>
									</div>
								</dl>
							</li>
						))}
					</ul> */}
				</div>
			</div>
			<div className="border border-dashed border-gray-900/5" />
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-base/7 font-semibold text-gray-900">
						Recent Payments
					</h2>
					<Link
						prefetch
						href="/payments"
						className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
					>
						View all<span className="sr-only">, clients</span>
					</Link>
				</div>
				<div className=" overflow-hidden border-t border-gray-100">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
							<table className="w-full text-left">
								<thead className="sr-only">
									<tr>
										<th>Amount</th>
										<th className="hidden sm:table-cell">Booking</th>
										<th>More details</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(groupedPayments).map(([date, payments]) => (
										<Fragment key={date}>
											{/* Date Header Row */}
											<tr className="text-sm/6 text-gray-900">
												<th
													scope="colgroup"
													colSpan={3}
													className="relative isolate py-2 font-semibold"
												>
													<time dateTime={date}>{formatDateHeader(date)}</time>
													<div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
													<div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
												</th>
											</tr>
											{/* Payment Rows for that date */}
											{payments.map((payment) => (
												<tr key={payment.id}>
													<td className="relative py-5 pr-6">
														<div className="flex gap-x-6">
															<ArrowDownCircleIcon
																aria-hidden="true"
																className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
															/>
															<div className="flex-auto">
																<div className="flex items-start gap-x-3">
																	<div className="text-sm/6 font-medium text-gray-900">
																		{formatCurrency(payment.amount)}
																	</div>
																	<div
																		className={cn(
																			paymentStatusStyle,
																			"rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
																		)}
																	>
																		Received
																	</div>
																</div>
															</div>
														</div>
														<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
														<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
													</td>
													<td className="hidden py-5 pr-6 sm:table-cell">
														<div className="text-sm/6 text-gray-900">
															{payment.bookingName || "N/A"}
														</div>
													</td>
													<td className="py-5 text-right">
														<div className="flex justify-end">
															<a
																href="/"
																className="text-sm/6 font-medium text-indigo-600 hover:text-indigo-500"
															>
																View
																<span className="hidden sm:inline">
																	{" "}
																	payment
																</span>
															</a>
														</div>
														<div className="mt-1 text-xs/5 text-gray-500">
															Payment ID{" "}
															<span className="text-gray-900">
																#{payment.id}
															</span>
														</div>
													</td>
												</tr>
											))}
										</Fragment>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
