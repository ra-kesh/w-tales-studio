"use client";

import { cn } from "@/lib/utils";
import {
	ArrowDownCircleIcon,
	ArrowUpCircleIcon,
	ArrowUpIcon,
	BellIcon,
} from "lucide-react";
import { ChartAreaInteractive } from "./chart-area";
import { parseAsString, useQueryState } from "nuqs";
import { type DashboardData, useDashboardData } from "@/hooks/use-dashboard";

const secondaryNavigation = [
	{ name: "Last Week", href: "#", current: true },
	{ name: "Last Month", href: "#", current: false },
	{ name: "Last Year", href: "#", current: false },
	{ name: "All-time", href: "#", current: false },
];
const stats = [
	{
		name: "Revenue",
		value: "$405,091.00",
		change: "+4.75%",
		changeType: "positive",
	},
	{
		name: "Overdue invoices",
		value: "$12,787.00",
		change: "+54.02%",
		changeType: "negative",
	},
	{
		name: "Outstanding invoices",
		value: "$245,988.00",
		change: "-1.39%",
		changeType: "positive",
	},
	{
		name: "Expenses",
		value: "$30,156.00",
		change: "+10.18%",
		changeType: "negative",
	},
];
const statuses = {
	Paid: "text-green-700 bg-green-50 ring-green-600/20",
	Withdraw: "text-gray-600 bg-gray-50 ring-gray-500/10",
	Overdue: "text-red-700 bg-red-50 ring-red-600/10",
};
const days = [
	{
		date: "Today",
		dateTime: "2023-03-22",
		transactions: [
			{
				id: 1,
				invoiceNumber: "00012",
				href: "#",
				amount: "$7,600.00 USD",
				tax: "$500.00",
				status: "Paid",
				client: "Reform",
				description: "Website redesign",
				icon: ArrowUpCircleIcon,
			},
			{
				id: 2,
				invoiceNumber: "00011",
				href: "#",
				amount: "$10,000.00 USD",
				status: "Withdraw",
				client: "Tom Cook",
				description: "Salary",
				icon: ArrowDownCircleIcon,
			},
			{
				id: 3,
				invoiceNumber: "00009",
				href: "#",
				amount: "$2,000.00 USD",
				tax: "$130.00",
				status: "Overdue",
				client: "Tuple",
				description: "Logo design",
				icon: ArrowUpIcon,
			},
		],
	},
	{
		date: "Yesterday",
		dateTime: "2023-03-21",
		transactions: [
			{
				id: 4,
				invoiceNumber: "00010",
				href: "#",
				amount: "$14,000.00 USD",
				tax: "$900.00",
				status: "Paid",
				client: "SavvyCal",
				description: "Website redesign",
				icon: ArrowUpCircleIcon,
			},
		],
	},
];
const clients = [
	{
		id: 1,
		name: "Tuple",
		imageUrl: "https://tailwindui.com/plus-assets/img/logos/48x48/tuple.svg",
		lastInvoice: {
			date: "December 13, 2022",
			dateTime: "2022-12-13",
			amount: "$2,000.00",
			status: "Overdue",
		},
	},
	{
		id: 2,
		name: "SavvyCal",
		imageUrl: "https://tailwindui.com/plus-assets/img/logos/48x48/savvycal.svg",
		lastInvoice: {
			date: "January 22, 2023",
			dateTime: "2023-01-22",
			amount: "$14,000.00",
			status: "Paid",
		},
	},
	{
		id: 3,
		name: "Reform",
		imageUrl: "https://tailwindui.com/plus-assets/img/logos/48x48/reform.svg",
		lastInvoice: {
			date: "January 23, 2023",
			dateTime: "2023-01-23",
			amount: "$7,600.00",
			status: "Paid",
		},
	},
];

export default function DashboardClient() {
	const [interval, setInterval] = useQueryState(
		"interval",
		parseAsString.withDefault("30d"),
	);

	const { data, isLoading, isError } = useDashboardData({ interval });

	if (isLoading && !data) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return (
			<div className="flex h-full items-center justify-center">
				<p>Error loading dashboard data. Please try again.</p>
			</div>
		);
	}

	// MODIFIED: Updated empty data structure
	const emptyData: DashboardData = {
		kpis: { projectedRevenue: "0", collectedCash: "0", totalExpenses: "0" },
		bookingAnalytics: {
			summary: { totalBookings: 0, activeBookings: 0, cancellationRate: 0 },
			recentNewBookings: [],
			packageTypeDistribution: [],
			bookingsOverTime: [],
		},
		actionItems: {
			overdueTasks: [],
			overdueDeliverables: [],
			unstaffedShoots: [],
		},
		operations: {
			upcomingShoots: [],
			upcomingTasks: [],
			upcomingDeliverables: [],
		},
	};

	const { kpis, actionItems, bookingAnalytics } = data || emptyData;

	return (
		<>
			<main>
				<div className="relative isolate overflow-hidden">
					{/* Secondary navigation */}
					<header className="pb-4 pt-6 sm:pb-6">
						<div className="mx-auto flex justify-between items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
							<h1 className="text-base/7 font-semibold text-gray-900">
								Cashflow
							</h1>
							<div className="order-last flex w-full gap-x-8 text-sm/6 font-semibold sm:order-none sm:w-auto sm:pl-6 sm:text-sm/7">
								{secondaryNavigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={
											item.current ? "text-indigo-600" : "text-gray-700"
										}
									>
										{item.name}
									</a>
								))}
							</div>
						</div>
					</header>

					<div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
						<dl className="mx-auto grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
							{stats.map((stat, statIdx) => (
								<div
									key={stat.name}
									className={cn(
										statIdx % 2 === 1
											? "sm:border-l"
											: statIdx === 2
												? "lg:border-l"
												: "",
										"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8",
									)}
								>
									<dt className="text-sm/6 font-medium text-gray-500">
										{stat.name}
									</dt>
									<dd
										className={cn(
											stat.changeType === "negative"
												? "text-rose-600"
												: "text-gray-700",
											"text-xs font-medium",
										)}
									>
										{stat.change}
									</dd>
									<dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
										{stat.value}
									</dd>
								</div>
							))}
						</dl>
					</div>

					{/* <div
						aria-hidden="true"
						className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
					>
						<div
							style={{
								clipPath:
									"polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
							}}
							className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
						/>
					</div> */}
				</div>

				<div className="space-y-16 py-16 xl:space-y-20">
					{/* Recent activity table */}
					<div>
						<div className="mx-auto  px-4 sm:px-6 lg:px-8">
							<h2 className="mx-auto max-w-2xl text-base font-semibold text-gray-900 lg:mx-0 lg:max-w-none">
								Booking Activity
							</h2>
						</div>
					</div>

					{/* Recent client list*/}
					<div className="mx-auto  px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
							<div className="flex items-center justify-between">
								<h2 className="text-base/7 font-semibold text-gray-900">
									Recent clients
								</h2>
								<a
									href="#"
									className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
								>
									View all<span className="sr-only">, clients</span>
								</a>
							</div>
							<ul
								role="list"
								className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
							>
								{clients.map((client) => (
									<li
										key={client.id}
										className="overflow-hidden rounded-xl border border-gray-200"
									>
										<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
											<img
												alt={client.name}
												src={client.imageUrl}
												className="size-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
											/>
											<div className="text-sm/6 font-medium text-gray-900">
												{client.name}
											</div>
										</div>
										<dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm/6">
											<div className="flex justify-between gap-x-4 py-3">
												<dt className="text-gray-500">Last invoice</dt>
												<dd className="text-gray-700">
													<time dateTime={client.lastInvoice.dateTime}>
														{client.lastInvoice.date}
													</time>
												</dd>
											</div>
											<div className="flex justify-between gap-x-4 py-3">
												<dt className="text-gray-500">Amount</dt>
												<dd className="flex items-start gap-x-2">
													<div className="font-medium text-gray-900">
														{client.lastInvoice.amount}
													</div>
													<div
														className={cn(
															statuses[client.lastInvoice.status],
															"rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
														)}
													>
														{client.lastInvoice.status}
													</div>
												</dd>
											</div>
										</dl>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
