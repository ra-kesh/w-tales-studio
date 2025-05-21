"use client";

import { PaperclipIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { ReceivedPayments } from "./booking-financials/received-payments";
import { UpcomingPayments } from "./booking-financials/upcoming-payments";
import { Expenses } from "./booking-financials/expenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDetail } from "@/types/booking";
import { Progress } from "@/components/ui/progress";

interface BookingOverviewProps {
  booking: BookingDetail;
}

export function BookingOverview({ booking }: BookingOverviewProps) {
  const packageCost = Number(booking.packageCost);

  const totalReceived = booking.receivedAmounts.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const totalExpenses = booking.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const totalScheduled = booking.paymentSchedules.reduce(
    (sum, schedule) => sum + Number(schedule.amount),
    0
  );

  const packageAmount = Number(packageCost);
  const pendingAmount = packageAmount - totalReceived;
  const profit = packageAmount - totalExpenses;

  // Calculate completion percentage
  const paymentPercentage = Math.min(
    Math.round((totalReceived / packageAmount) * 100),
    100
  );

  // Define booking milestones
  const milestones = [
    {
      id: "advance",
      label: "Advance Payment",
      status: totalReceived > 0 ? "completed" : "not-started",
      date: (() => {
        try {
          return booking.receivedAmounts.length > 0 &&
            booking.receivedAmounts[0].paidOn
            ? format(new Date(booking.receivedAmounts[0].paidOn), "d MMM, yyyy")
            : null;
        } catch (error) {
          console.error("Error formatting advance payment date:", error);
          return null;
        }
      })(),
    },
    {
      id: "shoots",
      label: "Shoots Completed",
      status: (() => {
        // Check if there are any shoots
        if (!booking.shoots || booking.shoots.length === 0)
          return "not-started";

        // Get current date for comparison
        const currentDate = new Date();

        // Check if all shoots have dates in the past
        const allCompleted = booking.shoots.every(
          (shoot) => shoot.date && new Date(shoot.date) < currentDate
        );

        // Check if some shoots have dates in the past
        const someCompleted = booking.shoots.some(
          (shoot) => shoot.date && new Date(shoot.date) < currentDate
        );

        if (allCompleted) return "completed";
        if (someCompleted) return "in-progress";
        return "not-started";
      })(),
      date: null,
    },
    {
      id: "deliverables",
      label: "Deliverables Completed",
      status: booking.deliverables?.every(
        (deliverable) => deliverable.status === "completed"
      )
        ? "completed"
        : booking.deliverables?.some(
            (deliverable) => deliverable.status === "completed"
          )
        ? "in-progress"
        : "not-started",
      date: null,
    },
    {
      id: "payment",
      label: "Full Payment Received",
      status: paymentPercentage === 100 ? "completed" : "not-started",
      date: (() => {
        try {
          return paymentPercentage === 100 &&
            booking.receivedAmounts.length > 0 &&
            booking.receivedAmounts[booking.receivedAmounts.length - 1].paidOn
            ? format(
                new Date(
                  booking.receivedAmounts[booking.receivedAmounts.length - 1]
                    .paidOn as string
                ),
                "d MMM, yyyy"
              )
            : null;
        } catch (error) {
          console.error("Error formatting final payment date:", error);
          return null;
        }
      })(),
    },
  ];

  // Calculate overall project completion
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const overallCompletion = Math.round(
    (completedMilestones / milestones.length) * 100
  );

  return (
    <div className="space-y-8">
      {/* Project Progress Card */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <span className="text-sm font-medium text-orange-500">
              {overallCompletion}% Completed
            </span>
          </div>

          <Progress
            value={overallCompletion}
            // check later background color change according to overallCompletion data
            className={
              (cn(
                overallCompletion < 30
                  ? "bg-red-500"
                  : overallCompletion < 70
                  ? "bg-orange-500"
                  : "bg-green-500"
              ),
              "h-2 mb-6")
            }
          />

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {milestone.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : milestone.status === "in-progress" ? (
                    <Clock className="h-5 w-5 text-orange-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className="text-sm font-medium">{milestone.label}</span>
                </div>
                <div className="text-sm">
                  {milestone.status === "completed" ? (
                    <span className="text-green-600">
                      Completed {milestone.date && `(${milestone.date})`}
                    </span>
                  ) : milestone.status === "in-progress" ? (
                    <span className="text-orange-500">In Progress</span>
                  ) : (
                    <span className="text-gray-400">Not Started</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary - Redesigned to be more compact */}
      <div className="bg-white rounded-lg border shadow-sm p-5">
        <h3 className="text-base font-semibold mb-4">Financial Summary</h3>
        
        <div className="flex flex-col space-y-4">
          {/* Package and Payment Progress */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Package</span>
              <p className="text-xl font-bold">₹{packageAmount.toLocaleString()}</p>
            </div>
            <div className="w-1/2">
              <div className="flex justify-between text-xs mb-1">
                <span>Received: <span className="font-medium text-green-600">₹{totalReceived.toLocaleString()}</span> ({paymentPercentage}%)</span>
                <span>Pending: <span className="font-medium text-orange-500">₹{pendingAmount.toLocaleString()}</span> ({100 - paymentPercentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${paymentPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Expenses and Profit */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
              <p className="text-xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
              <p className="text-xl font-bold text-green-600">₹{profit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round((profit / packageAmount) * 100)}% profit margin
              </p>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 pt-3 border-t">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Received</span>
              <p className="text-lg font-semibold text-green-600">{paymentPercentage}%</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
              <p className="text-lg font-semibold text-orange-500">{100 - paymentPercentage}%</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Expenses</span>
              <p className="text-lg font-semibold text-red-500">{Math.round((totalExpenses / packageAmount) * 100)}%</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Profit</span>
              <p className="text-lg font-semibold text-green-600">{Math.round((profit / packageAmount) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Activities */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-5">
          <h3 className="text-base font-semibold mb-4">Payment Activities</h3>
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
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-5">
          <h3 className="text-base font-semibold mb-4">Attachments</h3>
          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
            <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
              <div className="flex w-0 flex-1 items-center">
                <PaperclipIcon
                  aria-hidden="true"
                  className="h-4 w-4 flex-shrink-0 text-gray-400"
                />
                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                  <span className="truncate font-medium">
                    weddingtales_client_proposal.pdf
                  </span>
                  <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Download
                </a>
              </div>
            </li>
            <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
              <div className="flex w-0 flex-1 items-center">
                <PaperclipIcon
                  aria-hidden="true"
                  className="h-4 w-4 flex-shrink-0 text-gray-400"
                />
                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                  <span className="truncate font-medium">
                    weddingtales_client_agreement.pdf
                  </span>
                  <span className="flex-shrink-0 text-gray-400">4.5mb</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Download
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
