import { Plus } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import type { BookingDetail } from "@/types/booking";
import { Expenses } from "./expenses";
import { ReceivedPayments } from "./received-payments";
import { UpcomingPayments } from "./upcoming-payments";

const BookingFinance = ({ booking }: { booking: BookingDetail }) => {
	const packageCost = Number(booking.packageCost);

	const totalReceived = booking.receivedAmounts.reduce(
		(sum, payment) => sum + Number(payment.amount),
		0,
	);

	const totalExpenses = booking.expenses.reduce(
		(sum, expense) => sum + Number(expense.amount),
		0,
	);

	const packageAmount = Number(packageCost);
	const pendingAmount = packageAmount - totalReceived;
	const profit = packageAmount - totalExpenses;

	// Calculate completion percentage
	const paymentPercentage = Math.min(
		Math.round((totalReceived / packageAmount) * 100),
		100,
	);

	const { setParams } = usePaymentsParams();

	const { setParams: setExpenseParams } = useExpenseParams();

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Finances</h2>
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setParams({ createReceivedPayment: true });
						}}
					>
						<Plus className="h-4 w-4 mr-2" />
						Received Payment
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setParams({ createScheduledPayment: true });
						}}
					>
						<Plus className="h-4 w-4 mr-2" />
						Schedule Payment
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setExpenseParams({ createExpense: true });
						}}
					>
						<Plus className="h-4 w-4 mr-2" />
						Expense
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-6 ">
				<div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<span className="text-sm text-muted-foreground">
								Total Expenses
							</span>
							<p className="text-xl font-bold text-red-500">
								₹{totalExpenses.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{Math.round((totalExpenses / packageAmount) * 100)}% of package
							</p>
						</div>
						<div>
							<span className="text-sm text-muted-foreground">Net Profit</span>
							<p className="text-xl font-bold text-green-600">
								₹{profit.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{Math.round((profit / packageAmount) * 100)}% profit margin
							</p>
						</div>
					</div>
				</div>

				<div className="flex justify-end items-center w-full">
					<div className="">
						<span className="text-sm text-muted-foreground">Total Package</span>
						<p className="text-2xl font-bold">
							₹{packageAmount.toLocaleString()}
						</p>
					</div>
				</div>
			</div>

			<Card className="my-6">
				<CardContent>
					<div className="flex justify-between text-xs mb-1">
						<span>
							Received:{" "}
							<span className="font-medium text-green-600">
								₹{totalReceived.toLocaleString()}
							</span>{" "}
							({paymentPercentage}%)
						</span>
						<span>
							Pending:{" "}
							<span className="font-medium text-orange-500">
								₹{pendingAmount.toLocaleString()}
							</span>{" "}
							({100 - paymentPercentage}%)
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-green-500 h-2 rounded-full"
							style={{ width: `${paymentPercentage}%` }}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Payment Activities Tabs */}
			<Tabs defaultValue="received" className="w-full">
				<TabsList className="grid w-full grid-cols-3 mb-4">
					<TabsTrigger value="received">Received Payments</TabsTrigger>
					<TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
					<TabsTrigger value="expenses">Expenses</TabsTrigger>
				</TabsList>
				<TabsContent value="received" className="mt-0">
					<ReceivedPayments receivedAmounts={booking.receivedAmounts} />
				</TabsContent>
				<TabsContent value="upcoming" className="mt-0">
					<UpcomingPayments paymentSchedules={booking.paymentSchedules} />
				</TabsContent>
				<TabsContent value="expenses" className="mt-0">
					<Expenses expenses={booking.expenses} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default BookingFinance;
