"use client";

import { Calendar, Clock, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { Fragment } from "react";
import { PaymentSchedule } from "@/types/booking";

interface UpcomingPaymentsProps {
  paymentSchedules: PaymentSchedule[];
}

export function UpcomingPayments({ paymentSchedules }: UpcomingPaymentsProps) {
  if (!paymentSchedules.length) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No upcoming payments scheduled
      </div>
    );
  }

  // Group payments by due date
  const groupedPayments = paymentSchedules.reduce((acc, payment) => {
    const dueDate = payment.dueDate
      ? new Date(payment.dueDate as string)
      : null;
    const dateKey = dueDate ? format(dueDate, "yyyy-MM-dd") : "No Date";
    const displayDate = dueDate ? format(dueDate, "MMMM d, yyyy") : "No Date";

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: displayDate,
        dateTime: dateKey,
        payments: [],
      };
    }

    acc[dateKey].payments.push(payment);
    return acc;
  }, {} as Record<string, { date: string; dateTime: string; payments: PaymentSchedule[] }>);

  const sortedDates = Object.values(groupedPayments).sort((a, b) =>
    a.dateTime.localeCompare(b.dateTime)
  );

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left">
        <thead className="sr-only">
          <tr>
            <th>Amount</th>
            <th className="hidden sm:table-cell">Description</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((day) => (
            <Fragment key={day.dateTime}>
              <tr className="text-sm leading-6 text-gray-900">
                <th
                  scope="colgroup"
                  colSpan={3}
                  className="relative isolate py-2 font-semibold px-4"
                >
                  <time dateTime={day.dateTime}>{day.date}</time>
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                </th>
              </tr>
              {day.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="relative py-5 px-4">
                    <div className="flex gap-x-6">
                      <div className="flex-auto">
                        <div className="flex items-start gap-x-3">
                          <div className="text-sm font-medium leading-6 text-gray-900">
                            ₹{Number(payment.amount).toLocaleString()}
                          </div>
                          <div className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            Upcoming
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="hidden py-5 px-4 sm:table-cell">
                    <div className="text-sm leading-6 text-gray-900">
                      {(payment.description as string) || "Payment"}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end items-center ">
                      <Clock className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm text-gray-500">
                        {payment.dueDate
                          ? format(
                              new Date(payment.dueDate as string),
                              "MMM d, yyyy"
                            )
                          : "No date"}
                      </span>
                    </div>
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
