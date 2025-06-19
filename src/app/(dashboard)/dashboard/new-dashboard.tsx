"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CustomTabsContent,
	CustomTabsList,
	CustomTabsTrigger,
	Tabs,
} from "@/components/ui/tabs";
import { type DashboardData, useDashboardData } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryState } from "nuqs";
import { UpcomingWork } from "./upcmingwork";
import { OverdueWork } from "./overduework";
import { RecentBookings } from "./_components/recent-bookings";
import { RecentBookingDashboard } from "./recent-booking";
import { ExpenseBreakdown } from "./_components/expense-breakdown";

export default function Example() {
	const [interval, setInterval] = useQueryState(
		"interval",
		parseAsString.withDefault("all"),
	);

	const [operationsInterval, setOperationsInterval] = useQueryState(
		"operationsInterval",
		parseAsString.withDefault("7d"), // Default to 7 days
	);

	const { data, isLoading, isError } = useDashboardData({
		interval,
		operationsInterval,
	});

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
			summary: { totalBookings: 0, activeBookings: 0, newBookings: 0 },
			recentNewBookings: [],
			packageTypeDistribution: [],
			bookingsOverTime: [],
		},

		expenseAnalytics: [],

		actionItems: {
			overdueTasks: [],
			overdueDeliverables: [],
			unstaffedShoots: [],
		},
		operations: {
			upcomingShoots: { list: [], total: 0 },
			upcomingTasks: { list: [], total: 0 },
			upcomingDeliverables: { list: [], total: 0 },
		},
	};

	// ADAPTED: Destructure the correct data object
	const { kpis, actionItems, bookingAnalytics, operations, expenseAnalytics } =
		data || emptyData;
	return (
		<>
			<main>
				<header className="relative isolate ">
					<div
						aria-hidden="true"
						className="absolute inset-0 -z-10 overflow-hidden"
					>
						<div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
							<div
								style={{
									clipPath:
										"polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
								}}
								className="aspect-1154/678 w-[72.125rem] bg-linear-to-br from-[#FF80B5] to-[#9089FC]"
							/>
						</div>
						<div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
					</div>

					<div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
						<div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
							<div className="flex items-center gap-x-6">
								<img
									alt=""
									src="https://tailwindui.com/plus-assets/img/logos/48x48/tuple.svg"
									className="size-16 flex-none rounded-full ring-1 ring-gray-900/10"
								/>
								<h1>
									<div className="text-sm/6 text-gray-500">
										Invoice <span className="text-gray-700">#00011</span>
									</div>
									<div className="mt-1 text-base font-semibold text-gray-900">
										Tuple, Inc
									</div>
								</h1>
							</div>
							<div className="flex items-center gap-x-4 sm:gap-x-6">
								<button
									type="button"
									className="hidden text-sm/6 font-semibold text-gray-900 sm:block"
								>
									Copy URL
								</button>
								<a
									href="/"
									className="hidden text-sm/6 font-semibold text-gray-900 sm:block"
								>
									Edit
								</a>
								<a
									href="/"
									className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
								>
									Send
								</a>
							</div>
						</div>
					</div>
				</header>

				<div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
						<div className="lg:col-start-3 lg:row-end-1">
							<div className="flex items-end justify-between mb-5">
								<div className="mt-3">
									<h2 className="text-base font-semibold leading-6 text-gray-900">
										Cashflow
									</h2>
									<p className=" text-sm text-gray-500">
										Track your finances over time.
									</p>
								</div>
								<Select value={interval} onValueChange={setInterval}>
									<SelectTrigger className="h-6 w-[130px] text-xs font-semibold text-gray-900/90">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Time</SelectItem>
										<SelectItem value="30d">Last 30 days</SelectItem>
										<SelectItem value="90d">Last Quarter</SelectItem>
										<SelectItem value="1y">Last Year</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<KpiStats kpis={kpis} />
						</div>

						<div className="lg:col-start-3">
							<div className="flex items-end justify-between mb-4">
								<div>
									<h2 className="text-base font-semibold leading-6 text-gray-900">
										Expense Breakdown
									</h2>
									<p className=" text-sm text-gray-500">
										Track expenses in across different categories
									</p>
								</div>
							</div>
							<ExpenseBreakdown data={expenseAnalytics} />
						</div>

						<div className="-mx-4  sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2">
							<Tabs defaultValue="booking">
								<CustomTabsList>
									<CustomTabsTrigger value="booking">
										Booking Activity
									</CustomTabsTrigger>
									<CustomTabsTrigger value="upcoming">
										Upcoming Work
									</CustomTabsTrigger>
									{/* <CustomTabsTrigger value="bookings">
										New Bookings
									</CustomTabsTrigger>
									<CustomTabsTrigger value="account">
										Recent Payments
									</CustomTabsTrigger> */}
									<CustomTabsTrigger value="overdue">
										Overdue Work
									</CustomTabsTrigger>
								</CustomTabsList>
								<CustomTabsContent value="booking" className="space-y-6">
									<BookingStats bookingAnalytics={bookingAnalytics} />
									<div className="border border-dashed border-gray-900/5" />
									<RecentBookingDashboard
										recentBookings={bookingAnalytics.recentNewBookings}
									/>
								</CustomTabsContent>
								<CustomTabsContent value="upcoming" className="space-y-6">
									<UpcomingStats operations={operations} />
									<div className="border border-dashed border-gray-900/5" />
									<UpcomingWork operations={operations} />
								</CustomTabsContent>
								<CustomTabsContent value="overdue" className="space-y-6">
									<OverdueStats actionItems={actionItems} />
									<div className="border border-dashed border-gray-900/5" />
									<OverdueWork actionItems={actionItems} />
								</CustomTabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}

const KpiStats = ({ kpis }: { kpis: DashboardData["kpis"] }) => {
	const stats = [
		{ name: "Revenue", value: kpis.projectedRevenue },
		{ name: "Received", value: kpis.collectedCash },
		{ name: "Expenses", value: kpis.totalExpenses },
		{ name: "Overdue", value: kpis.overdueInvoicesValue },
	];

	return (
		<div className="rounded-lg ring-1 shadow-xs ring-gray-900/5">
			<dl className="grid grid-cols-2">
				{stats.map((stat, statIdx) => (
					<div
						key={stat.name}
						className={cn(
							"flex flex-col px-4 py-6 sm:px-6 xl:px-8 xl:py-8 relative",
							statIdx < stats.length / 2 ? "border-b border-gray-900/5" : "",
						)}
					>
						{statIdx % 2 === 0 && (
							<div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-[50%] bg-gray-900/5" />
						)}
						<dt className="text-xs font-medium text-gray-500">{stat.name}</dt>
						<dd className="mt-1 text-lg font-medium tracking-tight text-gray-900">
							{formatCurrency(stat.value)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
// const BookingStats = ({
// 	bookingAnalytics,
// }: { bookingAnalytics: DashboardData["bookingAnalytics"] }) => {
// 	const stats = [
// 		{ name: "Total", value: bookingAnalytics.summary.totalBookings },
// 		{ name: "Active", value: bookingAnalytics.summary.activeBookings },
// 		{ name: "New", value: bookingAnalytics.summary.newBookings },
// 	];

// 	return (
// 		<div className="rounded-lg ring-1 shadow-xs ring-gray-900/5">
// 			<dl className="grid grid-cols-3">
// 				{stats.map((stat, statIdx) => (
// 					<div
// 						key={stat.name}
// 						className={cn(
// 							"flex flex-col px-4 py-6 sm:px-6 xl:px-8 xl:py-8 relative",
// 						)}
// 					>
// 						{statIdx < stats.length - 1 && (
// 							<div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-[50%] bg-gray-900/5" />
// 						)}
// 						<dt className="text-xs font-medium text-gray-500">{stat.name}</dt>
// 						<dd className="mt-1 text-lg font-medium tracking-tight text-gray-900">
// 							{stat.value}
// 						</dd>
// 					</div>
// 				))}
// 			</dl>
// 		</div>
// 	);
// };

const formatCurrency = (value: string | number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number(value));
};

const UpcomingStats = ({
	operations,
}: { operations: DashboardData["operations"] }) => {
	const stats = [
		{ name: "Total  Shoots", value: operations.upcomingShoots.total },
		{ name: "Total  Tasks", value: operations.upcomingTasks.total },
		{
			name: "Total  Deliverables",
			value: operations.upcomingDeliverables.total,
		},
	];

	return (
		<div className=" rounded-lg ring-1 shadow-xs ring-gray-900/5">
			<dl className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:px-2 xl:px-0">
				{stats.map((stat, statIdx) => (
					<div
						key={stat.name}
						className={cn(
							statIdx % 2 === 1
								? "sm:border-l"
								: statIdx === 2
									? "lg:border-l"
									: "",
							"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2  px-4 py-6 sm:px-6 ",
						)}
					>
						<dt className="text-xs font-medium text-gray-500">{stat.name}</dt>
						<dd className="w-full flex-none text-2xl font-medium tracking-tight text-gray-900">
							{stat.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
const OverdueStats = ({
	actionItems,
}: { actionItems: DashboardData["actionItems"] }) => {
	const stats = [
		{ name: "Overdue Tasks", value: actionItems.overdueTasks.length },
		{
			name: "Overdue  Deliverables",
			value: actionItems.overdueDeliverables.length,
		},
		{ name: "Unstaffed Shoots", value: actionItems.unstaffedShoots.length },
	];

	return (
		<div className=" rounded-lg ring-1 shadow-xs ring-gray-900/5">
			<dl className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:px-2 xl:px-0">
				{stats.map((stat, statIdx) => (
					<div
						key={stat.name}
						className={cn(
							statIdx % 2 === 1
								? "sm:border-l"
								: statIdx === 2
									? "lg:border-l"
									: "",
							"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2  px-4 py-6 sm:px-6 ",
						)}
					>
						<dt className="text-xs font-medium text-gray-500">{stat.name}</dt>
						<dd className="w-full flex-none text-2xl font-medium tracking-tight text-gray-900">
							{stat.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
const BookingStats = ({
	bookingAnalytics,
}: { bookingAnalytics: DashboardData["bookingAnalytics"] }) => {
	const stats = [
		{ name: "Total Bookings", value: bookingAnalytics.summary.totalBookings },
		{ name: "Active Bookings", value: bookingAnalytics.summary.activeBookings },
		{ name: "New Bookings", value: bookingAnalytics.summary.newBookings },
	];

	return (
		<div className=" rounded-lg ring-1 shadow-xs ring-gray-900/5">
			<dl className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:px-2 xl:px-0">
				{stats.map((stat, statIdx) => (
					<div
						key={stat.name}
						className={cn(
							statIdx % 2 === 1
								? "sm:border-l"
								: statIdx === 2
									? "lg:border-l"
									: "",
							"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2  px-4 py-6 sm:px-6 ",
						)}
					>
						<dt className="text-xs font-medium text-gray-500">{stat.name}</dt>
						<dd className="w-full flex-none text-2xl font-medium tracking-tight text-gray-900">
							{stat.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
