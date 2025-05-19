"use client";

import { Calendar, TrendingDown, ArrowDown, Users } from "lucide-react";
import { format } from "date-fns";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/db/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const expenseDate = expense.date ? new Date(expense.date as string) : null;
    const dateKey = expenseDate ? format(expenseDate, "yyyy-MM-dd") : "No Date";
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
  }, {} as Record<string, { date: string; dateTime: string; expenses: Expense[] }>);

  const sortedDates = Object.values(groupedExpenses).sort(
    (a, b) => b.dateTime.localeCompare(a.dateTime) // Reverse sort - newest first
  );

  const getCategoryBadgeStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'travel':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'food':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'equipment':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'location':
        return 'bg-orange-50 text-orange-700 ring-orange-600/20';
      case 'drink':
        return 'bg-pink-50 text-pink-700 ring-pink-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <div className="space-y-4">
      {sortedDates.map((day) => (
        <div key={day.dateTime} className="border rounded-md overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-muted/50">
            <Calendar className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-sm">
              <time dateTime={day.dateTime}>{day.date}</time>
            </h3>
          </div>

          <div className="divide-y">
            {day.expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-4 px-4"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ₹{Number(expense.amount).toLocaleString()}
                      </span>
                      {expense.category && (
                        <div className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          getCategoryBadgeStyles(expense.category)
                        )}>
                          {expense.category}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {(expense.description as string) || "Expense"}
                    </div>
                    {expense.expensesAssignments && expense.expensesAssignments.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex -space-x-2">
                          {expense.expensesAssignments.slice(0, 3).map((assignment) => {
                            const name = assignment.crew.member?.user?.name || assignment.crew.name;
                            const initials = name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("");

                            return (
                              <Avatar
                                key={assignment.id}
                                className="h-6 w-6 border-2 border-background"
                              >
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })}
                        </div>
                        {expense.expensesAssignments.length > 3 && (
                          <Badge variant="secondary" className="rounded-full text-xs">
                            +{expense.expensesAssignments.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    View transaction
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
