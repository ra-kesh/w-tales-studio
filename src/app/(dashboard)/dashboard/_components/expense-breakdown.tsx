"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ExpenseData {
	category: string;
	total: number;
}

const COLORS = [
	"#FF8042",
	"#00C49F",
	"#0088FE",
	"#FFBB28",
	"#9333ea",
	"#e11d48",
];

export function ExpenseBreakdown({ data }: { data: ExpenseData[] }) {
	if (!data || data.length === 0) {
		return (
			<CardContent className="flex h-[180px] items-center justify-center rounded-lg ring-1 shadow-xs ring-gray-900/5">
				<p className="text-sm text-muted-foreground">
					No expense data available for this period.
				</p>
			</CardContent>
		);
	}

	const totalExpenses = data.reduce((acc, curr) => acc + curr.total, 0);

	const chartData = data.map((item, index) => ({
		name: item.category,
		value: item.total,
		color: COLORS[index % COLORS.length],
		percentage:
			totalExpenses > 0 ? ((item.total / totalExpenses) * 100).toFixed(0) : 0,
	}));

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 rounded-lg ring-1 shadow-xs ring-gray-900/5">
			<div className="h-[180px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={38}
							outerRadius={54}
							paddingAngle={2}
							dataKey="value"
							nameKey="name"
						>
							{chartData.map((entry) => (
								<Cell key={`cell-${entry.name}`} fill={entry.color} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
			</div>

			<div className="flex flex-col justify-center space-y-4 sm:pr-4 xl:pr-6">
				{chartData.map((entry) => (
					<div key={entry.name} className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className="h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-sm text-muted-foreground">
								{entry.name}
							</span>
						</div>
						<span className="text-sm font-semibold">{entry.percentage}%</span>
					</div>
				))}
			</div>
		</div>
	);
}
