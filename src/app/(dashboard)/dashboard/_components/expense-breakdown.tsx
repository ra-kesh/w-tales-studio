"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const expenseData = [
	{
		name: "Equipment",
		value: 85000,
		color: "#2563eb",
		spent: 85000,
		budget: 100000,
	},
	{
		name: "Marketing",
		value: 45000,
		color: "#16a34a",
		spent: 45000,
		budget: 50000,
	},
	{
		name: "Studio Rent",
		value: 35000,
		color: "#9333ea",
		spent: 35000,
		budget: 40000,
	},
	{
		name: "Travel",
		value: 25000,
		color: "#ea580c",
		spent: 25000,
		budget: 30000,
	},
	{
		name: "Software",
		value: 15000,
		color: "#4f46e5",
		spent: 15000,
		budget: 20000,
	},
];

const totalSpent = expenseData.reduce((acc, curr) => acc + curr.spent, 0);
const totalBudget = expenseData.reduce((acc, curr) => acc + curr.budget, 0);

export function ExpenseBreakdown() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<Card>
				<CardHeader>
					<CardTitle>Expense Analysis</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={expenseData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={2}
									dataKey="value"
								>
									{expenseData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(value: number) => [
										`₹${value.toLocaleString()}`,
										"Spent",
									]}
								/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Total Spent</span>
							<span>
								₹{totalSpent.toLocaleString()} / ₹{totalBudget.toLocaleString()}
							</span>
						</div>
						<Progress value={(totalSpent / totalBudget) * 100} />
					</div>

					<div className="space-y-4">
						{expenseData.map((expense, index) => (
							<motion.div
								key={expense.name}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 * index }}
								className="flex items-center justify-between space-x-4"
							>
								<div className="flex items-center space-x-3">
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: expense.color }}
									/>
									<span className="text-sm font-medium">{expense.name}</span>
								</div>
								<div className="flex items-center space-x-3">
									<span className="text-sm">
										₹{expense.spent.toLocaleString()}
									</span>
									<Badge
										variant={
											expense.spent <= expense.budget
												? "default"
												: "destructive"
										}
										className="text-xs"
									>
										{((expense.spent / expense.budget) * 100).toFixed(0)}%
									</Badge>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
