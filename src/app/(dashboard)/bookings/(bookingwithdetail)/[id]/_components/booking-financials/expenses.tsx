"use client";

import { Calendar, TrendingDown, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/db/schema";

interface ExpensesProps {
	expenses: Expense[];
}

export function Expenses({ expenses }: ExpensesProps) {
	if (!expenses.length) {
		return (
			<div className="text-sm text-muted-foreground py-4">
				No expenses recorded yet
			</div>
		);
	}

	// Group expenses by date
	const groupedExpenses = expenses.reduce(
		(acc, expense) => {
			const expenseDate = expense.date
				? new Date(expense.date as string)
				: null;
			const dateKey = expenseDate
				? format(expenseDate, "yyyy-MM-dd")
				: "No Date";
			const displayDate = expenseDate
				? format(expenseDate, "MMMM d, yyyy")
				: "No Date";

			if (!acc[dateKey]) {
				acc[dateKey] = {
					date: displayDate,
					dateTime: dateKey,
					expenses: [],
				};
			}

			acc[dateKey].expenses.push(expense);
			return acc;
		},
		{} as Record<
			string,
			{ date: string; dateTime: string; expenses: Expense[] }
		>,
	);

	const sortedDates = Object.values(groupedExpenses).sort(
		(a, b) => b.dateTime.localeCompare(a.dateTime), // Reverse sort - newest first
	);

	return (
		<div className="overflow-hidden">
			<table className="w-full text-left">
				<thead className="sr-only">
					<tr>
						<th>Amount</th>
						<th className="hidden sm:table-cell">Description</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{sortedDates.map((day) => (
						<Fragment key={day.dateTime}>
							<tr className="text-sm leading-6 text-gray-900">
								<th
									scope="colgroup"
									colSpan={3}
									className="relative isolate py-2 px-4 font-semibold"
								>
									<time dateTime={day.dateTime}>{day.date}</time>
									<div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
									<div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
								</th>
							</tr>
							{day.expenses.map((expense) => (
								<tr key={expense.id}>
									<td className="relative py-5 px-4">
										<div className="flex gap-x-6">
											<div className="flex-auto">
												<div className="flex items-start gap-x-3">
													<div className="text-sm font-medium leading-6 text-gray-900">
														₹{Number(expense.amount).toLocaleString()}
													</div>
													<div className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
														Expense
													</div>
												</div>
											</div>
										</div>
										<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
										<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
									</td>
									<td className="hidden py-5 px-4 sm:table-cell">
										<div className="text-sm leading-6 text-gray-900">
											{(expense.description as string) || "Expense"}
										</div>
										{expense.category && (
											<div className="mt-1 text-xs leading-5 text-gray-500">
												{expense.category}
											</div>
										)}
									</td>
									<td className="py-5 px-4 text-right">
										<div className="flex justify-end">
											<a
												href="#"
												className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500"
											>
												View
												<span className="hidden sm:inline"> transaction</span>
												{/* <span className="sr-only">
													, invoice #1120,{" "}
													{transaction.client}
												</span> */}
											</a>
										</div>
										{/* <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
											<span className="text-sm text-gray-500">
												{expense.date
													? format(
															new Date(expense.date as string),
															"MMM d, yyyy",
														)
													: "No date"}
											</span> */}
									</td>
								</tr>
							))}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}
