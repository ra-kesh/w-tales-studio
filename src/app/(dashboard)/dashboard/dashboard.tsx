"use client";

import { cn } from "@/lib/utils";
import {
	ArrowDownCircleIcon,
	ArrowUpCircleIcon,
	Camera,
	CheckCircle2,
	Clock,
	FileText,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { type DashboardData, useDashboardData } from "@/hooks/use-dashboard";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Value } from "@radix-ui/react-select";
import { Button } from "@react-email/components";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

// --- Helper Functions & Objects ---
const formatCurrency = (value: string | number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number(value));
};

const secondaryNavigation = [
	{ name: "Last 7 days", value: "7d" },
	{ name: "Last 30 days", value: "30d" },
	// { name: "Last 3 months", value: "90d",  },
	{ name: "Last 365 days", value: "365d" },
	{ name: "All-time", value: "all" },
];

// --- Sub-Components ---

const KpiStats = ({ kpis }: { kpis: DashboardData["kpis"] }) => {
	const stats = [
		{ name: "Revenue", value: kpis.projectedRevenue },
		{ name: "Collected Cash", value: kpis.collectedCash },
		{ name: "Expenses", value: kpis.totalExpenses },
		{ name: "Overdue Invoices", value: kpis.overdueInvoicesValue },
	];

	return (
		<div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
			<dl className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
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
						<dt className="text-sm/6 font-medium text-gray-500">{stat.name}</dt>
						<dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
							{formatCurrency(stat.value)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};

const RecentBookings = ({
	bookings,
}: {
	bookings: DashboardData["bookingAnalytics"]["recentNewBookings"];
}) => {
	const router = useRouter();

	return (
		<div className=" overflow-hidden border-gray-100">
			<div className="mx-auto">
				<table className="w-full text-left">
					<thead className="sr-only">
						<tr>
							<th>Booking Details</th>
							<th className="hidden sm:table-cell">Client</th>
							<th>More details</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((booking) => (
							<tr key={booking.id}>
								<td className="relative py-5 pr-6">
									<div className="flex gap-x-6">
										{/* <ArrowUpCircleIcon
											className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
											aria-hidden="true"
										/> */}
										<div className="flex-auto">
											<div className="text-sm/6 font-medium text-gray-900">
												{booking.name}
											</div>
											<div className="mt-1 text-xs/5 text-gray-500">
												{booking.packageType}
											</div>
										</div>
									</div>
									<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
									<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
								</td>
								<td className="hidden py-5 pr-6 sm:table-cell">
									<div className="text-sm/6 text-gray-900">
										{booking.clientName}
									</div>
									<div className="mt-1 text-xs/5 text-gray-500">
										{format(new Date(booking.createdAt), "MMM d, yyyy")}
									</div>
								</td>
								<td className="py-5 text-right">
									<div className="flex justify-end">
										<Button
											onClick={() => {
												router.push(`/bookings/${booking.id}`);
											}}
											className="text-sm/6 font-medium text-indigo-600 hover:text-indigo-500"
										>
											View
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const statuses = {
	Paid: "text-green-700 bg-green-50 ring-green-600/20",
	Withdraw: "text-gray-600 bg-gray-50 ring-gray-500/10",
	Overdue: "text-red-700 bg-red-50 ring-red-600/10",
};

const ImportantActions = ({
	actionItems,
}: {
	actionItems: DashboardData["actionItems"];
}) => {
	// This component remains the same as the previous version
	const totalItems =
		actionItems.overdueTasks.length +
		actionItems.overdueDeliverables.length +
		actionItems.unstaffedShoots.length;

	const ActionItem = ({ icon: Icon, title, subtitle, time }: any) => (
		<div className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors">
			{/* <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white border">
				<Icon className="h-4 w-4 text-red-600" />
			</div> */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-900 truncate">{title}</p>
				<p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
			</div>
			<div className="text-right flex-shrink-0">
				<p className="text-xs font-semibold text-red-600">{time} ago</p>
			</div>
		</div>
	);

	const router = useRouter();

	return (
		<Tabs defaultValue="tasks">
			<TabsList className="grid w-full grid-cols-3 mb-4">
				<TabsTrigger value="tasks">
					Tasks ({actionItems.overdueTasks.length})
				</TabsTrigger>
				<TabsTrigger value="deliverables">
					Deliverables ({actionItems.overdueDeliverables.length})
				</TabsTrigger>
				<TabsTrigger value="shoots">
					Shoots ({actionItems.unstaffedShoots.length})
				</TabsTrigger>
			</TabsList>
			<ScrollArea className="h-[400px] pr-4">
				<TabsContent value="tasks" className="mt-0">
					{actionItems.overdueTasks.length > 0 ? (
						<div className="space-y-3">
							{actionItems.overdueTasks.map((item: any) => (
								<ActionItem
									key={`task-${item.id}`}
									icon={Clock}
									title={item.description}
									subtitle={`For ${item.bookingName}`}
									time={formatDistanceToNowStrict(new Date(item.dueDate))}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-10">
							<CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
							<p className="mt-4 text-sm font-medium">All caught up!</p>
						</div>
					)}
				</TabsContent>
				{/* ... other tabs content ... */}
			</ScrollArea>
		</Tabs>
	);
};

// --- Main Dashboard Component ---

export default function DashboardClient() {
	const [interval, setInterval] = useQueryState(
		"interval",
		parseAsString.withDefault("all"),
	);

	const { data, isLoading, isError } = useDashboardData({ interval });

	if (isLoading && !data) {
		return <div>Loading dashboard...</div>; // Or a skeleton loader
	}

	if (isError) {
		return <div>Error loading dashboard data. Please try again.</div>;
	}

	const emptyData: DashboardData = {
		kpis: {
			projectedRevenue: "0",
			collectedCash: "0",
			totalExpenses: "0",
			overdueInvoicesValue: "0",
		},
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

	// ADAPTED: Destructure the correct data object
	const { kpis, actionItems, bookingAnalytics } = data || emptyData;

	const tabs = [
		{ name: "My Account", href: "#", current: false },
		{ name: "Company", href: "#", current: false },
		{ name: "Team Members", href: "#", current: true },
		{ name: "Billing", href: "#", current: false },
	];

	return (
		<main>
			<div className="relative isolate overflow-hidden">
				{/* Secondary navigation */}
				<header className="pb-4 pt-6 sm:pb-6">
					<div className="mx-auto flex justify-between items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
						<h1 className="text-base/7 font-semibold text-gray-900">
							Cashflow
						</h1>
						<div className="order-last flex w-full gap-x-8 text-sm/6 font-semibold sm:order-none sm:w-auto  sm:pl-6 sm:text-sm/7">
							{secondaryNavigation.map((item) => (
								<span
									key={item.name}
									onClick={() => setInterval(item.value)}
									onKeyUp={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											setInterval(item.value);
										}
									}}
									className={cn(
										"cursor-pointer rounded-md px-3 py-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
										"focus:ring-offset-2",
										"focus-visible:ring-2 focus-visible:ring-indigo-500",
										interval === item.value
											? "text-indigo-600"
											: "text-gray-700",
									)}
								>
									{item.name}
								</span>
							))}
						</div>
					</div>
				</header>

				<KpiStats kpis={kpis} />
			</div>

			<div className="hidden sm:block">
				<div className="border-b border-gray-200">
					<nav aria-label="Tabs" className="-mb-px flex">
						{tabs.map((tab) => (
							<a
								key={tab.name}
								href={tab.href}
								aria-current={tab.current ? "page" : undefined}
								className={cn(
									tab.current
										? "border-indigo-500 text-indigo-600"
										: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
									"w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium",
								)}
							>
								{tab.name}
							</a>
						))}
					</nav>
				</div>
			</div>

			<section className="min-h-[calc(100vh-4rem)] bg-gray-50/30">
				<div className="mx-auto  px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
						<div className="lg:col-span-6 space-y-6">
							<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
								<div className="p-6 border-b border-gray-100">
									<h2 className="text-lg font-semibold text-gray-900">
										Recent New Bookings
									</h2>
									<p className="mt-1 text-sm text-gray-500">
										Track your latest booking activities
									</p>
								</div>
								<div className="p-6">
									<RecentBookings
										bookings={bookingAnalytics.recentNewBookings}
									/>
								</div>
							</div>
						</div>

						{/* Important Actions Section */}
						<div className="lg:col-span-5">
							<div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full overflow-hidden">
								<div className="p-6 border-b border-gray-100">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-lg font-semibold text-gray-900">
												Important Actions
											</h2>
											<p className="mt-1 text-sm text-gray-500">
												Items requiring attention
											</p>
										</div>
									</div>
								</div>
								<div className="p-6">
									<ImportantActions actionItems={actionItems} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

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
				icon: ArrowUpCircleIcon,
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
