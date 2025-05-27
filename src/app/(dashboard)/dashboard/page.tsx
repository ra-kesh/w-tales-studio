import { DashboardMetrics } from "./_components/dashboard-metrics";
import { RecentBookings } from "./_components/recent-bookings";
import { UpcomingShoots } from "./_components/upcoming-shoots";
import { PendingDeliverables } from "./_components/pending-deliverables";
import { RevenueChart } from "./_components/revenue-chart";
import { ExpenseBreakdown } from "./_components/expense-breakdown";

export default function DashboardPage() {
	return (
		<div className="flex-1 space-y-4 p-6 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
			</div>
			<div className="space-y-4">
				<DashboardMetrics />

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<div className="col-span-4">
						<RevenueChart />
					</div>
					<div className="col-span-3">
						<ExpenseBreakdown />
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<PendingDeliverables />
					<RecentBookings />
					<UpcomingShoots />
				</div>
			</div>
		</div>
	);
}
