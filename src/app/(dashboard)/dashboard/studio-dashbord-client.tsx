// // components/dashboard/studio-dashboard-client.tsx
// "use client";

// import { useDashboardData, type DashboardData } from "@/hooks/use-dashboard";
// import { useQueryState, parseAsString } from "nuqs";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
// 	AlertTriangle,
// 	ArrowDownToLine,
// 	Banknote,
// 	CalendarClock,
// 	FileText,
// 	Package,
// 	Target,
// 	Users,
// } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { format, formatDistanceToNowStrict } from "date-fns";
// import { cn } from "@/lib/utils";

// // --- Reusable Sub-Components ---

// const KpiCard = ({
// 	title,
// 	value,
// 	icon: Icon,
// }: {
// 	title: string;
// 	value: number;
// 	icon: React.ElementType;
// }) => (
// 	<Card>
// 		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 			<CardTitle className="text-sm font-medium">{title}</CardTitle>
// 			<Icon className="h-4 w-4 text-muted-foreground" />
// 		</CardHeader>
// 		<CardContent>
// 			<div className="text-2xl font-bold">
// 				{new Intl.NumberFormat("en-US", {
// 					style: "currency",
// 					currency: "USD",
// 				}).format(value)}
// 			</div>
// 		</CardContent>
// 	</Card>
// );

// const ChartPlaceholder = ({ height = "h-80" }) => (
// 	<div
// 		className={cn(
// 			"w-full rounded-lg bg-muted/50 flex items-center justify-center",
// 			height,
// 		)}
// 	>
// 		<p className="text-sm text-muted-foreground">[Chart Placeholder]</p>
// 	</div>
// );

// const ActionItem = ({
// 	icon: Icon,
// 	title,
// 	subtitle,
// 	time,
// 	timePrefix = "Due",
// }: {
// 	icon: React.ElementType;
// 	title: string;
// 	subtitle: string;
// 	time: string;
// 	timePrefix?: string;
// }) => (
// 	<div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
// 		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
// 			<Icon className="h-4 w-4 text-destructive" />
// 		</div>
// 		<div className="flex-1">
// 			<p className="text-sm font-medium leading-tight">{title}</p>
// 			<p className="text-xs text-muted-foreground">{subtitle}</p>
// 		</div>
// 		<p className="text-xs text-destructive font-semibold whitespace-nowrap">
// 			{timePrefix} {time}
// 		</p>
// 	</div>
// );

// const OperationItem = ({
// 	icon: Icon,
// 	title,
// 	subtitle,
// 	date,
// }: {
// 	icon: React.ElementType;
// 	title: string;
// 	subtitle: string;
// 	date: Date;
// }) => (
// 	<div className="flex items-center gap-4 p-2">
// 		<Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
// 		<div className="flex-1">
// 			<p className="text-sm font-medium">{title}</p>
// 			<p className="text-xs text-muted-foreground">{subtitle}</p>
// 		</div>
// 		<p className="text-sm text-muted-foreground font-mono">
// 			{format(date, "MMM dd")}
// 		</p>
// 	</div>
// );

// // --- Main Client Component ---

// export default function StudioDashboardClient() {
// 	// --- State Management with nuqs ---
// 	const [financialsFilter, setFinancialsFilter] = useQueryState(
// 		"financialsInterval",
// 		parseAsString.withDefault("all"),
// 	);
// 	const [bookingsFilter, setBookingsFilter] = useQueryState(
// 		"bookingsInterval",
// 		parseAsString.withDefault("30d"),
// 	);
// 	const [operationsFilter, setOperationsFilter] = useQueryState(
// 		"operationsInterval",
// 		parseAsString.withDefault("30d"),
// 	);

// 	// --- Data Fetching ---
// 	const { data, isLoading, isError } = useDashboardData({
// 		financialsInterval: financialsFilter,
// 		bookingsInterval: bookingsFilter,
// 		operationsInterval: operationsFilter,
// 	});

// 	if (isLoading && !data) {
// 		return <DashboardSkeleton />;
// 	}

// 	if (isError) {
// 		return (
// 			<div className="flex h-full items-center justify-center">
// 				<p>Error loading dashboard data. Please try again.</p>
// 			</div>
// 		);
// 	}

// 	// Fallback for empty data
// 	const emptyData: DashboardData = {
// 		kpis: { projectedRevenue: "0", collectedCash: "0", totalExpenses: "0" },
// 		bookingAnalytics: {
// 			summary: { totalBookings: 0, activeBookings: 0, cancellationRate: 0 },
// 			bookingTypeDistribution: [],
// 			packageTypeDistribution: [],
// 			bookingsOverTime: [],
// 		},
// 		actionItems: {
// 			overdueTasks: [],
// 			overdueDeliverables: [],
// 			unstaffedShoots: [],
// 		},
// 		operations: {
// 			upcomingShoots: [],
// 			upcomingTasks: [],
// 			upcomingDeliverables: [],
// 		},
// 	};

// 	const { kpis, bookingAnalytics, actionItems, operations } = data || emptyData;

// 	return (
// 		<div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
// 			{/* Section 1: Financial KPIs */}
// 			<section>
// 				<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
// 					<h2 className="text-2xl font-bold tracking-tight">
// 						Financial Overview
// 					</h2>
// 					<Select value={financialsFilter} onValueChange={setFinancialsFilter}>
// 						<SelectTrigger className="w-[180px]">
// 							<SelectValue />
// 						</SelectTrigger>
// 						<SelectContent>
// 							<SelectItem value="all">All Time</SelectItem>
// 							<SelectItem value="30d">Last 30 days</SelectItem>
// 							<SelectItem value="90d">Last Quarter</SelectItem>
// 							<SelectItem value="1y">Last Year</SelectItem>
// 						</SelectContent>
// 					</Select>
// 				</div>
// 				<div className="grid gap-4 md:grid-cols-3">
// 					<KpiCard
// 						title="Projected Revenue"
// 						value={Number(kpis.projectedRevenue)}
// 						icon={Target}
// 					/>
// 					<KpiCard
// 						title="Collected Cash"
// 						value={Number(kpis.collectedCash)}
// 						icon={ArrowDownToLine}
// 					/>
// 					<KpiCard
// 						title="Total Expenses"
// 						value={Number(kpis.totalExpenses)}
// 						icon={Banknote}
// 					/>
// 				</div>
// 			</section>

// 			{/* Section 2: Main Grid (Chart & Action Center) */}
// 			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// 				<div className="lg:col-span-2">
// 					<Card>
// 						<CardHeader className="flex flex-row items-center justify-between">
// 							<div>
// 								<CardTitle>Booking Analytics</CardTitle>
// 							</div>
// 							<Select value={bookingsFilter} onValueChange={setBookingsFilter}>
// 								<SelectTrigger className="w-[180px]">
// 									<SelectValue />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="7d">Last 7 days</SelectItem>
// 									<SelectItem value="30d">Last 30 days</SelectItem>
// 									<SelectItem value="90d">Last Quarter</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</CardHeader>
// 						<CardContent>
// 							<ChartPlaceholder />
// 						</CardContent>
// 					</Card>
// 				</div>

// 				<div className="lg:col-span-1">
// 					<Card className="h-full">
// 						<CardHeader>
// 							<CardTitle>Action Center</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-2">
// 							{actionItems.overdueTasks.map((item) => (
// 								<ActionItem
// 									key={`task-${item.id}`}
// 									icon={FileText}
// 									title={item.description}
// 									subtitle={`Task for ${item.bookingName}`}
// 									time={`${formatDistanceToNowStrict(new Date(item.dueDate))} ago`}
// 								/>
// 							))}
// 							{actionItems.overdueDeliverables.map((item) => (
// 								<ActionItem
// 									key={`del-${item.id}`}
// 									icon={Package}
// 									title={item.title}
// 									subtitle={`Deliverable for ${item.bookingName}`}
// 									time={`${formatDistanceToNowStrict(new Date(item.dueDate))} ago`}
// 								/>
// 							))}
// 							{actionItems.unstaffedShoots.map((item) => (
// 								<ActionItem
// 									key={`shoot-${item.id}`}
// 									icon={Users}
// 									title={item.title}
// 									subtitle={`Shoot for ${item.bookingName}`}
// 									time={`in ${formatDistanceToNowStrict(new Date(item.shootDate))}`}
// 									timePrefix="Starts"
// 								/>
// 							))}
// 							{actionItems.overdueTasks.length === 0 &&
// 								actionItems.overdueDeliverables.length === 0 &&
// 								actionItems.unstaffedShoots.length === 0 && (
// 									<p className="text-sm text-muted-foreground text-center py-10">
// 										No urgent items. Great job!
// 									</p>
// 								)}
// 						</CardContent>
// 					</Card>
// 				</div>
// 			</section>

// 			{/* Section 3: Operations Pipeline */}
// 			<section>
// 				<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
// 					<h2 className="text-2xl font-bold tracking-tight">
// 						Operations Pipeline
// 					</h2>
// 					<Select value={operationsFilter} onValueChange={setOperationsFilter}>
// 						<SelectTrigger className="w-[180px]">
// 							<SelectValue />
// 						</SelectTrigger>
// 						<SelectContent>
// 							<SelectItem value="7d">This Week</SelectItem>
// 							<SelectItem value="30d">Next 30 Days</SelectItem>
// 							<SelectItem value="90d">Next Quarter</SelectItem>
// 						</SelectContent>
// 					</Select>
// 				</div>
// 				<Card>
// 					<Tabs defaultValue="shoots">
// 						<CardHeader>
// 							<TabsList className="grid w-full grid-cols-3">
// 								<TabsTrigger value="shoots">Upcoming Shoots</TabsTrigger>
// 								<TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
// 								<TabsTrigger value="deliverables">
// 									Upcoming Deliverables
// 								</TabsTrigger>
// 							</TabsList>
// 						</CardHeader>
// 						<CardContent className="px-2">
// 							<TabsContent value="shoots">
// 								<div className="space-y-2">
// 									{operations.upcomingShoots.map((item) => (
// 										<OperationItem
// 											key={item.id}
// 											icon={CalendarClock}
// 											title={item.title}
// 											subtitle={`For ${item.bookingName}`}
// 											date={new Date(item.date)}
// 										/>
// 									))}
// 								</div>
// 							</TabsContent>
// 							<TabsContent value="tasks">
// 								<div className="space-y-2">
// 									{operations.upcomingTasks.map((item) => (
// 										<OperationItem
// 											key={item.id}
// 											icon={FileText}
// 											title={item.description}
// 											subtitle={`For ${item.bookingName}`}
// 											date={new Date(item.dueDate)}
// 										/>
// 									))}
// 								</div>
// 							</TabsContent>
// 							<TabsContent value="deliverables">
// 								<div className="space-y-2">
// 									{operations.upcomingDeliverables.map((item) => (
// 										<OperationItem
// 											key={item.id}
// 											icon={Package}
// 											title={item.title}
// 											subtitle={`For ${item.bookingName}`}
// 											date={new Date(item.dueDate)}
// 										/>
// 									))}
// 								</div>
// 							</TabsContent>
// 						</CardContent>
// 					</Tabs>
// 				</Card>
// 			</section>
// 		</div>
// 	);
// }

// // A simple skeleton loader for the initial page load
// function DashboardSkeleton() {
// 	return (
// 		<div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
// 			<div className="h-8 w-1/3 bg-muted rounded"></div>
// 			<div className="grid gap-4 md:grid-cols-3">
// 				<div className="h-24 bg-muted rounded-lg"></div>
// 				<div className="h-24 bg-muted rounded-lg"></div>
// 				<div className="h-24 bg-muted rounded-lg"></div>
// 			</div>
// 			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// 				<div className="lg:col-span-2 h-96 bg-muted rounded-lg"></div>
// 				<div className="lg:col-span-1 h-96 bg-muted rounded-lg"></div>
// 			</div>
// 			<div className="h-64 bg-muted rounded-lg"></div>
// 		</div>
// 	);
// }

// components/dashboard/studio-dashboard-client.tsx
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

// --- Reusable Sub-Components (No changes needed) ---

const KpiCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) => (
  <div className="border-r">
    <CardHeader className="flex flex-row items-center justify-between ">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)}
      </div>
    </CardContent>
  </div>
);

const ChartPlaceholder = ({ height = "h-[450px]" }) => (
  <div
    className={cn(
      "w-full rounded-lg bg-muted/50 flex items-center justify-center",
      height
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

// --- Main Client Component ---

export default function StudioDashboardClient() {
  // --- State Management with nuqs ---
  const [financialsFilter, setFinancialsFilter] = useQueryState(
    "financialsInterval",
    parseAsString.withDefault("all")
  );
  const [bookingsFilter, setBookingsFilter] = useQueryState(
    "bookingsInterval",
    parseAsString.withDefault("30d")
  );
  const [operationsFilter, setOperationsFilter] = useQueryState(
    "operationsInterval",
    parseAsString.withDefault("30d")
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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Financial Overview
              </h2>
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

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Action Center</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2">
                  {actionItems.overdueTasks.map((item) => (
                    <ActionItem
                      key={`task-${item.id}`}
                      // icon={FileText}
                      title={item.description}
                      subtitle={`Task for ${item.bookingName}`}
                      time={`${formatDistanceToNowStrict(
                        new Date(item.dueDate)
                      )} ago`}
                    />
                  ))}
                  {actionItems.overdueDeliverables.map((item) => (
                    <ActionItem
                      key={`del-${item.id}`}
                      // icon={Package}
                      title={item.title}
                      subtitle={`Deliverable for ${item.bookingName}`}
                      time={`${formatDistanceToNowStrict(
                        new Date(item.dueDate)
                      )} ago`}
                    />
                  ))}
                  {actionItems.unstaffedShoots.map((item) => (
                    <ActionItem
                      key={`shoot-${item.id}`}
                      // icon={Users}
                      title={item.title}
                      subtitle={`Shoot for ${item.bookingName}`}
                      time={`in ${formatDistanceToNowStrict(
                        new Date(item.shootDate)
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
          </Card>
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
