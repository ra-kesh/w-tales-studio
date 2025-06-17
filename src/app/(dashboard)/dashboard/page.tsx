// components/dashboard/studio-dashboard-v1.tsx
"use client";

import * as React from "react";
import {
	AlertTriangle,
	ArrowDownToLine,
	Banknote,
	CalendarClock,
	ChevronRight,
	FileText,
	Package,
	Target,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNowStrict } from "date-fns";

// --- MOCK DATA (Reflecting the new API structure) ---
const mockDashboardDataV1 = {
	financials: {
		projectedRevenue: 55000.0,
		collectedCash: 25500.75,
		totalExpenses: 8200.0,
	},
	actionItems: {
		overdueTasks: [
			{
				id: 1,
				description: "Final color grade",
				bookingName: "Smith Wedding",
				dueDate: new Date("2025-06-15"),
			},
		],
		overdueDeliverables: [
			{
				id: 2,
				title: "Highlight Reel",
				bookingName: "Johnson Corp.",
				dueDate: new Date("2025-06-14"),
			},
		],
		unstaffedShoots: [
			{
				id: 3,
				title: "Engagement Session",
				bookingName: "Miller Wedding",
				shootDate: new Date("2025-06-20"),
			},
		],
	},
	operations: {
		upcomingShoots: [
			{
				id: 101,
				title: "Main Ceremony",
				bookingName: "Miller Wedding",
				date: new Date("2025-06-22"),
			},
		],
		upcomingTasks: [
			{
				id: 201,
				description: "Prepare shot list",
				bookingName: "Miller Wedding",
				dueDate: new Date("2025-06-19"),
			},
		],
		upcomingDeliverables: [
			{
				id: 301,
				title: "Sneak Peek Photos",
				bookingName: "Miller Wedding",
				dueDate: new Date("2025-06-25"),
			},
		],
	},
};

// --- Reusable Sub-Components ---

const KpiCard = ({
	title,
	value,
	icon: Icon,
}: {
	title: string;
	value: number;
	icon: React.ElementType;
}) => (
	<Card>
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
	</Card>
);

const ChartPlaceholder = ({ height = "h-80" }) => (
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
	title,
	subtitle,
	time,
	timePrefix = "Due",
}: {
	title: string;
	subtitle: string;
	time: string;
	timePrefix?: string;
}) => (
	<div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg">
		<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
			<AlertTriangle className="h-4 w-4 text-destructive" />
		</div>
		<div className="flex-1">
			<p className="text-sm font-medium">{title}</p>
			<p className="text-xs text-muted-foreground">{subtitle}</p>
		</div>
		<p className="text-xs text-destructive font-semibold whitespace-nowrap">
			{timePrefix} {time}
		</p>
	</div>
);

// --- Main Dashboard Component ---

export default function StudioDashboardV1() {
	return (
		<div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
			{/* Zone 1: Financial Command Center */}
			<section>
				<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
					<h2 className="text-2xl font-bold tracking-tight">
						Financial Overview
					</h2>
					<Select defaultValue="30d">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">Last 7 days</SelectItem>
							<SelectItem value="30d">Last 30 days</SelectItem>
							<SelectItem value="90d">Last Quarter</SelectItem>
							<SelectItem value="1y">Last Year</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<KpiCard
						title="Projected Revenue"
						value={mockDashboardDataV1.financials.projectedRevenue}
						icon={Target}
					/>
					<KpiCard
						title="Collected Cash"
						value={mockDashboardDataV1.financials.collectedCash}
						icon={ArrowDownToLine}
					/>
					<KpiCard
						title="Total Expenses"
						value={mockDashboardDataV1.financials.totalExpenses}
						icon={Banknote}
					/>
				</div>
			</section>

			{/* Main Grid: Chart and Action Center */}
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Projected vs. Collected Revenue</CardTitle>
							<CardDescription>
								Visualizing the gap between invoiced work and cash in hand.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartPlaceholder />
						</CardContent>
					</Card>
				</div>

				{/* Zone 2: Action Center */}
				<div className="lg:col-span-1">
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Action Center</CardTitle>
							<CardDescription>
								Items that require your immediate attention.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{mockDashboardDataV1.actionItems.overdueTasks.map((item) => (
								<ActionItem
									key={`task-${item.id}`}
									title={item.description}
									subtitle={`Task for ${item.bookingName}`}
									time={`${formatDistanceToNowStrict(item.dueDate)} ago`}
								/>
							))}
							{mockDashboardDataV1.actionItems.overdueDeliverables.map(
								(item) => (
									<ActionItem
										key={`del-${item.id}`}
										title={item.title}
										subtitle={`Deliverable for ${item.bookingName}`}
										time={`${formatDistanceToNowStrict(item.dueDate)} ago`}
									/>
								),
							)}
							{mockDashboardDataV1.actionItems.unstaffedShoots.map((item) => (
								<ActionItem
									key={`shoot-${item.id}`}
									title={item.title}
									subtitle={`Shoot for ${item.bookingName}`}
									time={`in ${formatDistanceToNowStrict(item.shootDate)}`}
									timePrefix="Starts"
								/>
							))}
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Zone 3: Operations Pipeline */}
			<section>
				<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
					<h2 className="text-2xl font-bold tracking-tight">
						Operations Pipeline
					</h2>
					<Select defaultValue="30d">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">This Week</SelectItem>
							<SelectItem value="30d">Next 30 Days</SelectItem>
							<SelectItem value="90d">Next Quarter</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Tabs defaultValue="shoots">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="shoots">Upcoming Shoots</TabsTrigger>
						<TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
						<TabsTrigger value="deliverables">
							Upcoming Deliverables
						</TabsTrigger>
					</TabsList>
					<TabsContent value="shoots" className="mt-4">
						<Card>
							<CardContent className="p-4 space-y-2">
								{/* List items would be rendered here */}
								<p className="text-sm text-muted-foreground">
									(List of upcoming shoots...)
								</p>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="tasks" className="mt-4">
						<Card>
							<CardContent className="p-4 space-y-2">
								<p className="text-sm text-muted-foreground">
									(List of upcoming tasks...)
								</p>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="deliverables" className="mt-4">
						<Card>
							<CardContent className="p-4 space-y-2">
								<p className="text-sm text-muted-foreground">
									(List of upcoming deliverables...)
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
}
