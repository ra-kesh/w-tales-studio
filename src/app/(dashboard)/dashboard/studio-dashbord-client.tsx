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
	AlertTriangle,
	ArrowDownToLine,
	Banknote,
	CalendarClock,
	FileText,
	Package,
	Target,
	Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
		<CardHeader className="flex flex-row items-center justify-between ">
			<CardTitle className="text-xs font-medium">{title}</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="text-lg font-bold">
				{new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "INR",
				}).format(value)}
			</div>
		</CardContent>
	</Card>
);

const ChartPlaceholder = ({ height = "h-[300px]" }) => (
	<div
		className={cn(
			"w-full rounded-lg bg-muted/50 flex items-center justify-center",
			height,
		)}
	>
		<p className="text-sm text-muted-foreground">[Chart Placeholder]</p>
	</div>
);

const ActionItem = ({
	// icon: Icon,
	title,
	subtitle,
	time,
	timePrefix = "Due",
}: {
	// icon: React.ElementType;
	title: string;
	subtitle: string;
	time: string;
	timePrefix?: string;
}) => (
	<div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
		{/* <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
			<Icon className="h-4 w-4 text-destructive" />
		</div> */}
		<div className="flex-1">
			<p className="text-sm font-medium leading-tight">{title}</p>
			<p className="text-xs text-muted-foreground">{subtitle}</p>
		</div>
		<p className="text-xs text-destructive font-semibold whitespace-nowrap">
			{timePrefix} {time}
		</p>
	</div>
);

const OperationItem = ({
	icon: Icon,
	title,
	subtitle,
	date,
}: {
	icon: React.ElementType;
	title: string;
	subtitle: string;
	date: Date;
}) => (
	<div className="flex items-center gap-4 p-2">
		<Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
		<div className="flex-1">
			<p className="text-sm font-medium">{title}</p>
			<p className="text-xs text-muted-foreground">{subtitle}</p>
		</div>
		<p className="text-sm text-muted-foreground font-mono">
			{format(date, "MMM dd")}
		</p>
	</div>
);

export default function StudioDashboardClient() {
	// --- State Management with nuqs ---
	const [financialsFilter, setFinancialsFilter] = useQueryState(
		"financialsInterval",
		parseAsString.withDefault("all"),
	);
	const [bookingsFilter, setBookingsFilter] = useQueryState(
		"bookingsInterval",
		parseAsString.withDefault("30d"),
	);
	const [operationsFilter, setOperationsFilter] = useQueryState(
		"operationsInterval",
		parseAsString.withDefault("30d"),
	);

	// --- Data Fetching ---
	const { data, isLoading, isError } = useDashboardData({
		financialsInterval: financialsFilter,
		bookingsInterval: bookingsFilter,
		operationsInterval: operationsFilter,
	});

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

	// Fallback for empty data
	const emptyData: DashboardData = {
		kpis: { projectedRevenue: "0", collectedCash: "0", totalExpenses: "0" },
		bookingAnalytics: {
			summary: { totalBookings: 0, activeBookings: 0, cancellationRate: 0 },
			bookingTypeDistribution: [],
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

	const { kpis, actionItems, operations } = data || emptyData;

	return (
		<div className="flex-1 space-y-8 p-6">
			<section
				className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-dashed pb-6
      "
			>
				<div className="lg:col-span-2 space-y-6">
					<div>
						<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
							<div className="flex flex-col space-y-1">
								<p className="text-sm text-muted-foreground">Today is</p>
								<h2 className="text-xl font-bold tracking-tight">
									{format(new Date(), "EEEE, MMMM do, yyyy")}
								</h2>
							</div>
							<Select
								value={financialsFilter}
								onValueChange={setFinancialsFilter}
							>
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
						<div className="grid gap-4 md:grid-cols-3 border-b border-dashed pb-4">
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

					{/* Booking Analytics */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Booking Analytics</CardTitle>
							</div>
							<Select value={bookingsFilter} onValueChange={setBookingsFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="7d">Last 7 days</SelectItem>
									<SelectItem value="30d">Last 30 days</SelectItem>
									<SelectItem value="90d">Last Quarter</SelectItem>
								</SelectContent>
							</Select>
						</CardHeader>
						<CardContent>
							<ChartPlaceholder />
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-1 border-l border-dashed">
					<div className="h-full flex flex-col">
						<CardHeader>
							<CardTitle>Action Center</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea>
								<div className="space-y-2">
									{actionItems.overdueTasks.map((item) => (
										<ActionItem
											key={`task-${item.id}`}
											title={item.description}
											subtitle={`Task for ${item.bookingName}`}
											time={`${formatDistanceToNowStrict(
												new Date(item.dueDate),
											)} ago`}
										/>
									))}
									{actionItems.overdueDeliverables.map((item) => (
										<ActionItem
											key={`del-${item.id}`}
											title={item.title}
											subtitle={`Deliverable for ${item.bookingName}`}
											time={`${formatDistanceToNowStrict(
												new Date(item.dueDate),
											)} ago`}
										/>
									))}
									{actionItems.unstaffedShoots.map((item) => (
										<ActionItem
											key={`shoot-${item.id}`}
											title={item.title}
											subtitle={`Shoot for ${item.bookingName}`}
											time={`in ${formatDistanceToNowStrict(
												new Date(item.shootDate),
											)}`}
											timePrefix="Starts"
										/>
									))}
									{actionItems.overdueTasks.length === 0 &&
										actionItems.overdueDeliverables.length === 0 &&
										actionItems.unstaffedShoots.length === 0 && (
											<div className="flex h-full items-center justify-center">
												<p className="text-sm text-muted-foreground text-center py-10">
													No urgent items. Great job!
												</p>
											</div>
										)}
								</div>
							</ScrollArea>
						</CardContent>
					</div>
				</div>
			</section>
		</div>
	);
}

// A skeleton loader updated for the new layout
function DashboardSkeleton() {
	return (
		<div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column Skeleton */}
				<div className="lg:col-span-2 space-y-6">
					<div className="h-8 w-1/2 bg-muted rounded"></div>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="h-24 bg-muted rounded-lg"></div>
						<div className="h-24 bg-muted rounded-lg"></div>
						<div className="h-24 bg-muted rounded-lg"></div>
					</div>
					<div className="h-[550px] bg-muted rounded-lg"></div>
				</div>
				{/* Right Column Skeleton */}
				<div className="lg:col-span-1 h-full bg-muted rounded-lg"></div>
			</section>
			<div className="h-64 bg-muted rounded-lg"></div>
		</div>
	);
}
