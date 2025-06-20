import type { DashboardData } from "@/hooks/use-dashboard";
import { cn, formatCurrency } from "@/lib/utils";

export const KpiStats = ({ kpis }: { kpis: DashboardData["kpis"] }) => {
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

export const UpcomingStats = ({
	operations,
}: { operations: DashboardData["operations"] }) => {
	const stats = [
		{
			name: "Upcoming  Shoots",
			value: operations.upcomingShoots.list.length,
			total: operations.upcomingShoots.total,
		},
		{
			name: "Upcoming  Tasks",
			value: operations.upcomingTasks.list.length,
			total: operations.upcomingTasks.total,
		},
		{
			name: "Upcoming  Deliverables",
			value: operations.upcomingDeliverables.list.length,
			total: operations.upcomingDeliverables.total,
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
							{stat.value} / {stat.total}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
export const OverdueStats = ({
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
export const BookingStats = ({
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
