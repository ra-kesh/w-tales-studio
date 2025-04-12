"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { DollarSign, Receipt, CreditCard, Calculator } from "lucide-react";
import type { Expense, PaymentSchedule, ReceivedAmount } from "@/lib/db/schema";

interface BookingFinancialsProps {
	packageCost: string;
	receivedAmounts: ReceivedAmount[];
	paymentSchedules: PaymentSchedule[];
	expenses: Expense[];
}

export function BookingFinancials({
	packageCost,
	receivedAmounts,
	paymentSchedules,
	expenses,
}: BookingFinancialsProps) {
	const totalReceived = receivedAmounts.reduce(
		(sum, payment) => sum + Number(payment.amount),
		0,
	);
	const totalPending = paymentSchedules.reduce(
		(sum, schedule) => sum + Number(schedule.amount),
		0,
	);
	const totalExpenses = expenses.reduce(
		(sum, expense) => sum + Number(expense.amount),
		0,
	);

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Package Value</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${Number(packageCost).toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Received</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${totalReceived.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${totalPending.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Expenses</CardTitle>
						<Calculator className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${totalExpenses.toLocaleString()}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Payment History</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{receivedAmounts.map((payment) => (
							<div
								key={payment.id}
								className="flex items-center justify-between border-b pb-2 last:border-0"
							>
								<div>
									<div className="font-medium">
										${Number(payment.amount).toLocaleString()}
									</div>
									<div className="text-sm text-muted-foreground">
										{payment.description}
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									{format(new Date(payment.paidOn), "MMM dd, yyyy")}
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Upcoming Payments</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{paymentSchedules.map((schedule) => (
							<div
								key={schedule.id}
								className="flex items-center justify-between border-b pb-2 last:border-0"
							>
								<div>
									<div className="font-medium">
										${Number(schedule.amount).toLocaleString()}
									</div>
									<div className="text-sm text-muted-foreground">
										{schedule.description}
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									Due: {format(new Date(schedule.dueDate), "MMM dd, yyyy")}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Expenses</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{expenses.map((expense) => (
							<div
								key={expense.id}
								className="flex items-center justify-between border-b pb-2 last:border-0"
							>
								<div>
									<div className="font-medium">
										${Number(expense.amount).toLocaleString()}
									</div>
									<div className="text-sm text-muted-foreground">
										{expense.description}
									</div>
									<div className="text-xs text-muted-foreground">
										{expense.category} • Bill to: {expense.billTo}
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									{format(new Date(expense.date), "MMM dd, yyyy")}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
