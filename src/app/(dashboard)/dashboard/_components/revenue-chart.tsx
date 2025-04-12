"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const monthlyData = [
	{ month: "Jan", revenue: 245000, bookings: 15, target: 200000 },
	{ month: "Feb", revenue: 285000, bookings: 18, target: 200000 },
	{ month: "Mar", revenue: 320000, bookings: 22, target: 250000 },
	{ month: "Apr", revenue: 290000, bookings: 20, target: 250000 },
	{ month: "May", revenue: 380000, bookings: 25, target: 300000 },
	{ month: "Jun", revenue: 420000, bookings: 28, target: 300000 },
];

const packageData = [
	{ month: "Jan", wedding: 180000, prewedding: 45000, corporate: 20000 },
	{ month: "Feb", wedding: 200000, prewedding: 65000, corporate: 20000 },
	{ month: "Mar", wedding: 250000, prewedding: 50000, corporate: 20000 },
	{ month: "Apr", wedding: 220000, prewedding: 55000, corporate: 15000 },
	{ month: "May", wedding: 300000, prewedding: 60000, corporate: 20000 },
	{ month: "Jun", wedding: 350000, prewedding: 50000, corporate: 20000 },
];

export function RevenueChart() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<Card>
				<CardHeader>
					<CardTitle>Revenue Analytics</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="overview" className="space-y-4">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="packages">Package Types</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-4">
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={monthlyData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
										<Tooltip
											formatter={(value: number) => [
												`₹${value.toLocaleString()}`,
												"Revenue",
											]}
										/>
										<Line
											type="monotone"
											dataKey="revenue"
											stroke="#2563eb"
											strokeWidth={2}
											dot={{ r: 4 }}
											activeDot={{ r: 8 }}
										/>
										<Line
											type="monotone"
											dataKey="target"
											stroke="#9ca3af"
											strokeWidth={2}
											strokeDasharray="5 5"
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground">
											Average Revenue
										</div>
										<div className="text-2xl font-bold">
											₹
											{monthlyData
												.reduce((acc, curr) => acc + curr.revenue, 0)
												// / monthlyData.length
												.toLocaleString()}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground">
											Growth Rate
										</div>
										<div className="text-2xl font-bold text-emerald-600">
											+24.5%
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4">
										<div className="text-sm font-medium text-muted-foreground">
											Target Achievement
										</div>
										<div className="text-2xl font-bold text-blue-600">118%</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="packages">
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={packageData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
										<Tooltip
											formatter={(value: number) => [
												`₹${value.toLocaleString()}`,
											]}
										/>
										<Line
											type="monotone"
											dataKey="wedding"
											name="Wedding"
											stroke="#2563eb"
											strokeWidth={2}
											dot={{ r: 4 }}
										/>
										<Line
											type="monotone"
											dataKey="prewedding"
											name="Pre-Wedding"
											stroke="#16a34a"
											strokeWidth={2}
											dot={{ r: 4 }}
										/>
										<Line
											type="monotone"
											dataKey="corporate"
											name="Corporate"
											stroke="#9333ea"
											strokeWidth={2}
											dot={{ r: 4 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</motion.div>
	);
}
