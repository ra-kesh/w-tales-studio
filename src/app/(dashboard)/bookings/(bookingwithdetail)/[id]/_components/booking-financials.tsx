"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingDown } from "lucide-react";
import type { ReceivedAmount, PaymentSchedule, Expense } from "@/lib/db/schema";
import { UpcomingPayments } from "./booking-financials/upcoming-payments";
import { ReceivedPayments } from "./booking-financials/received-payments";
import { Expenses } from "./booking-financials/expenses";

interface BookingFinancialsProps {
  packageCost: string | number;
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
  const [activeTab, setActiveTab] = useState("received");

  // Calculate financial summary
  const totalReceived = receivedAmounts.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const totalScheduled = paymentSchedules.reduce(
    (sum, schedule) => sum + Number(schedule.amount),
    0
  );

  const packageAmount = Number(packageCost);
  const pendingAmount = packageAmount - totalReceived;
  const profit = packageAmount - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">₹{totalReceived.toLocaleString()}</div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((totalReceived / packageAmount) * 100).toFixed(0)}% of package cost
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-amber-600">₹{totalScheduled.toLocaleString()}</div>
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {paymentSchedules.length} scheduled payment{paymentSchedules.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((totalExpenses / packageAmount) * 100).toFixed(0)}% of package cost
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Package Cost</div>
              <div className="text-2xl font-bold">₹{packageAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Pending Amount</div>
              <div className="text-2xl font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm font-medium text-muted-foreground">Estimated Profit</div>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{profit.toLocaleString()}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${profit >= 0 ? 'bg-green-600' : 'bg-red-600'}`} 
                  style={{ width: `${Math.min(Math.max((profit / packageAmount) * 100, 0), 100)}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {((profit / packageAmount) * 100).toFixed(0)}% profit margin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="received">Received Payments</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="received" className="mt-0">
              <ReceivedPayments receivedAmounts={receivedAmounts} />
            </TabsContent>
            <TabsContent value="upcoming" className="mt-0">
              <UpcomingPayments paymentSchedules={paymentSchedules} />
            </TabsContent>
            <TabsContent value="expenses" className="mt-0">
              <Expenses expenses={expenses} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
