"use client";

import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";

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
import { ExpenseBreakdown } from "./_components/expense-breakdown";
import { OverdueWork } from "./_components/overduework";
import { PayementsAndClients } from "./_components/payment-activity";
import { RecentBookingDashboard } from "./_components/recent-booking";
import {
	BookingStats,
	KpiStats,
	OverdueStats,
	UpcomingStats,
} from "./_components/stats";
import { UpcomingWork } from "./_components/upcmingwork";

export default function DashboardClient() {
	const [interval, setInterval] = useQueryState(
		"interval",
		parseAsString.withDefault("all"),
	);

	const [operationsInterval, setOperationsInterval] = useQueryState(
		"operationsInterval",
		parseAsString.withDefault("7d"),
	);

	const router = useRouter();

	const { data, isLoading, isError } = useDashboardData({
		interval,
		operationsInterval,
	});

	if (isLoading && !data) {
		return <div>Loading dashboard...</div>;
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
			recentClients: [],
			recentPayments: [],
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

	const { kpis, actionItems, bookingAnalytics, operations, expenseAnalytics } =
		data || emptyData;

	return (
		<>
			<main>
				<div className="mx-auto  px-4 py-6 sm:px-6 pt-0">
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
							<div className="relative mb-4">
								<div
									aria-hidden="true"
									className="absolute inset-0 flex items-center"
								>
									<div className="w-full border border-gray-900/5 border-dashed" />
								</div>
								<div className="relative flex justify-start">
									<span className="bg-white pr-3 text-base font-semibold leading-6 text-gray-900">
										Expense Breakdown
									</span>
								</div>
							</div>

							<ExpenseBreakdown data={expenseAnalytics} />
						</div>

						<div className="-mx-4  sm:px-4 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 lg:border-r-1 border-dashed border-gray-900/5">
							<Tabs defaultValue="booking">
								<CustomTabsList>
									<CustomTabsTrigger value="booking">
										Booking Activity
									</CustomTabsTrigger>
									<CustomTabsTrigger value="upcoming">
										Upcoming Work
									</CustomTabsTrigger>
									<CustomTabsTrigger value="overdue">
										Overdue Work
									</CustomTabsTrigger>
									<CustomTabsTrigger value="payments">
										Payments & Clients
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
								<CustomTabsContent value="payments" className="space-y-6">
									<PayementsAndClients bookingAnalytics={bookingAnalytics} />
								</CustomTabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
