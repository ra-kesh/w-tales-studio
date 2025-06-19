"use client";

import { useDashboardData, type DashboardData } from "@/hooks/use-dashboard";
import { useQueryState, parseAsString } from "nuqs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Banknote,
	ArrowDownToLine,
	Target,
	Clock,
	Camera,
	FileText,
	CheckCircle2,
	Package,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookingsOverTimeChart } from "./booking-over-time";
import { PackagePerformanceChart } from "./package-perf";

// --- Reusable Components (KpiCard, ActionItem, ActionCenter) ---
// These components from your original file can remain unchanged.
// I'm including them here for completeness.

const KpiCard = ({
	title,
	value,
	icon: Icon,
}: {
	title: string;
	value: number;
	icon: React.ElementType;
}) => (
	<Card className="gap-1 rounded-lg">
		<CardHeader className="flex flex-row items-center justify-between pb-2">
			<CardTitle className="text-sm font-medium">{title}</CardTitle>
			<Icon className="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div className="text-2xl font-bold">
				{new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "INR",
					maximumFractionDigits: 0,
				}).format(value)}
			</div>
		</CardContent>
	</Card>
);

const ActionItem = ({
	icon: Icon,
	title,
	subtitle,
	time,
	timePrefix = "Due",
}: {
	icon: React.ElementType;
	title: string;
	subtitle: string;
	time: string;
	timePrefix?: string;
}) => (
	<div className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors">
		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white border">
			<Icon className="h-4 w-4 text-red-600" />
		</div>
		<div className="flex-1 min-w-0">
			<p className="text-sm font-medium text-gray-900 truncate">{title}</p>
			<p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
		</div>
		<div className="text-right flex-shrink-0">
			<p className="text-xs font-semibold text-red-600">
				{timePrefix} {time}
			</p>
		</div>
	</div>
);

const ActionCenter = ({ actionItems }: { actionItems: any }) => {
	const totalItems =
		actionItems.overdueTasks.length +
		actionItems.overdueDeliverables.length +
		actionItems.unstaffedShoots.length;

	return (
		<Card className="h-full">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">Action Center</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Items requiring your attention
						</p>
					</div>
					{totalItems > 0 && (
						<Badge variant="destructive" className="text-xs">
							{totalItems}
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="h-[calc(100%-120px)]">
				<Tabs defaultValue="tasks" className="h-full">
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="tasks" className="text-xs relative">
							Tasks
							{actionItems.overdueTasks.length > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
								>
									{actionItems.overdueTasks.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="deliverables" className="text-xs relative">
							Deliverables
							{actionItems.overdueDeliverables.length > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
								>
									{actionItems.overdueDeliverables.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="shoots" className="text-xs relative">
							Shoots
							{actionItems.unstaffedShoots.length > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
								>
									{actionItems.unstaffedShoots.length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>
					<TabsContent value="tasks" className="h-[calc(100%-60px)] mt-0">
						<ScrollArea className="h-full pr-4">
							{actionItems.overdueTasks.length > 0 ? (
								<div className="space-y-3">
									{actionItems.overdueTasks.map((item: any) => (
										<ActionItem
											key={`task-${item.id}`}
											icon={Clock}
											title={item.description}
											subtitle={`For ${item.bookingName}`}
											time={`${formatDistanceToNowStrict(
												new Date(item.dueDate),
											)} ago`}
										/>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
									<p className="text-sm font-medium">All caught up!</p>
									<p className="text-xs text-muted-foreground">
										No overdue tasks.
									</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>
					<TabsContent
						value="deliverables"
						className="h-[calc(100%-60px)] mt-0"
					>
						<ScrollArea className="h-full pr-4">
							{actionItems.overdueDeliverables.length > 0 ? (
								<div className="space-y-3">
									{actionItems.overdueDeliverables.map((item: any) => (
										<ActionItem
											key={`del-${item.id}`}
											icon={FileText}
											title={item.title}
											subtitle={`For ${item.bookingName}`}
											time={`${formatDistanceToNowStrict(
												new Date(item.dueDate),
											)} ago`}
										/>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
									<p className="text-sm font-medium">All delivered!</p>
									<p className="text-xs text-muted-foreground">
										No overdue deliverables.
									</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>
					<TabsContent value="shoots" className="h-[calc(100%-60px)] mt-0">
						<ScrollArea className="h-full pr-4">
							{actionItems.unstaffedShoots.length > 0 ? (
								<div className="space-y-3">
									{actionItems.unstaffedShoots.map((item: any) => (
										<ActionItem
											key={`shoot-${item.id}`}
											icon={Camera}
											title={item.title}
											subtitle={`For ${item.bookingName}`}
											time={`${formatDistanceToNowStrict(
												new Date(item.shootDate),
											)}`}
											timePrefix="In"
										/>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
									<p className="text-sm font-medium">All staffed!</p>
									<p className="text-xs text-muted-foreground">
										No unstaffed shoots coming up.
									</p>
								</div>
							)}
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

// NEW: Component to display recent new bookings
const RecentBookingsCard = ({
	bookings,
}: {
	bookings: DashboardData["bookingAnalytics"]["recentNewBookings"];
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent New Bookings</CardTitle>
			</CardHeader>
			<CardContent>
				{bookings && bookings.length > 0 ? (
					<div className="space-y-4">
						{bookings.map((booking) => (
							<div key={booking.id} className="flex items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									<Package className="h-5 w-5 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium truncate">{booking.name}</p>
									<p className="text-xs text-muted-foreground">
										{booking.clientName || "N/A"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium">{booking.packageType}</p>
									<p className="text-xs text-muted-foreground">
										{formatDistanceToNowStrict(new Date(booking.createdAt))} ago
									</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-10">
						<p className="text-sm text-muted-foreground">
							No new bookings to show.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default function StudioDashboardClient() {
	// MODIFIED: Use a single state for the filter
	const [interval, setInterval] = useQueryState(
		"interval",
		parseAsString.withDefault("30d"),
	);

	// MODIFIED: Call the hook with the simplified filter object
	const { data, isLoading, isError } = useDashboardData({ interval });

	if (isLoading && !data) {
		return <DashboardSkeleton />;
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
		<div className="flex-1 space-y-8 p-6">
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6 h-full">
					<div>
						<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
							<h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
							{/* MODIFIED: This select now controls the single interval */}
							<Select value={interval} onValueChange={setInterval}>
								<SelectTrigger className="w-[180px]">
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
						<div className="grid gap-4 md:grid-cols-3">
							<KpiCard
								title="Projected Revenue"
								value={Number(kpis.projectedRevenue)}
								icon={Target}
							/>
							<KpiCard
								title="Collected Cash"
								value={Number(kpis.collectedCash)}
								icon={ArrowDownToLine}
							/>
							<KpiCard
								title="Total Expenses"
								value={Number(kpis.totalExpenses)}
								icon={Banknote}
							/>
						</div>
					</div>

					<section className="space-y-6">
						{/* NEW: Display recent bookings */}
						<RecentBookingsCard bookings={bookingAnalytics.recentNewBookings} />

						<Card>
							<CardHeader>
								<CardTitle>Booking Analytics (All Time)</CardTitle>
							</CardHeader>
							<CardContent className="space-y-8">
								{bookingAnalytics.bookingsOverTime?.length > 0 ? (
									<BookingsOverTimeChart
										data={bookingAnalytics.bookingsOverTime}
										summary={bookingAnalytics.summary}
									/>
								) : (
									<p className="text-sm text-muted-foreground text-center py-10">
										No booking data available.
									</p>
								)}

								{bookingAnalytics.packageTypeDistribution?.length > 0 ? (
									<PackagePerformanceChart
										data={bookingAnalytics.packageTypeDistribution}
									/>
								) : (
									<p className="text-sm text-muted-foreground text-center py-10">
										No package data available.
									</p>
								)}
							</CardContent>
						</Card>
					</section>
				</div>

				<div className="lg:col-span-1 h-full">
					<ActionCenter actionItems={actionItems} />
				</div>
			</section>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="flex-1 space-y-6 p-8 animate-pulse">
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<div className="flex justify-between">
						<div className="h-8 w-1/4 bg-muted rounded"></div>
						<div className="h-10 w-[180px] bg-muted rounded-lg"></div>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="h-24 bg-muted rounded-lg"></div>
						<div className="h-24 bg-muted rounded-lg"></div>
						<div className="h-24 bg-muted rounded-lg"></div>
					</div>
					<div className="h-[250px] bg-muted rounded-lg"></div>
					<div className="h-[400px] bg-muted rounded-lg"></div>
				</div>
				<div className="lg:col-span-1 h-[600px] bg-muted rounded-lg"></div>
			</section>
		</div>
	);
}
