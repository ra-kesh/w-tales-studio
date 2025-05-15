"use client";

import { motion } from "framer-motion";
import { Calendar, DollarSign, Wallet, BookOpen } from "lucide-react";
import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookingStatsProps {
	stats: {
		totalBookings: string;
		activeBookings: string;
		totalExpenses: string;
		totalRevenue: string;
	};
}

export function BookingStats({ stats }: BookingStatsProps) {
	const metrics = [
		{
			title: "Total Products",
			value: 248,
			change: "+12 this week",
			trend: "up",
			icon: BookOpen,
		},
		{
			title: "Active Listings",
			value: 186,
			change: "+2% of total",
			trend: "up",
			icon: Calendar,
		},
		{
			title: "Total Sales",
			value: 8944,
			change: "+2.1% this week",
			trend: "up",
			icon: Wallet,
		},
		{
			title: "Total Revenue",
			value: 8944,
			change: "-0.5% vs last week",
			trend: "down",
			icon: DollarSign,
			prefix: "$",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
			{metrics.map((metric, index) => (
				<motion.div
					key={metric.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<CardContent
						className={cn(index < metrics.length - 1 ? "border-r" : "")}
					>
						{/* <div className="flex items-center justify-between">
								<metric.icon className="h-5 w-5 text-muted-foreground" />
								<span
									className={`text-sm font-medium ${
										metric.trend === "up" ? "text-emerald-500" : "text-rose-500"
									}`}
								>
									{metric.change}
								</span>
							</div> */}
						<div className="mt-4">
							<h3 className="text-sm font-medium text-muted-foreground">
								{metric.title}
							</h3>
							<div className="mt-2 flex items-baseline">
								<span className="text-2xl font-bold">
									{metric.prefix || ""}
									<CountUp
										end={metric.value}
										separator=","
										duration={2}
										decimals={metric.title === "Total Revenue" ? 2 : 0}
									/>
								</span>
							</div>
						</div>
					</CardContent>
				</motion.div>
			))}
		</div>
	);
}
