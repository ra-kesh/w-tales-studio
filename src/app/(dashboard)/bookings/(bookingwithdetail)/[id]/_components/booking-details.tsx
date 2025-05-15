"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  CheckSquare,
  Camera,
  ChevronRight,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingDetail } from "@/lib/db/schema";
import { BookingOverview } from "./booking-overview";
import { BookingShoots } from "./booking-shoots";
import { BookingDeliverables } from "./booking-deliverables";
import { BookingFinancials } from "./booking-financials";
import { BookingCrew } from "./booking-crew";
import { BookingTasks } from "./booking-tasks";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BookingDetails({ booking }: { booking: BookingDetail }) {
  const [activeTab, setActiveTab] = useState("shoots");
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const tabs = [
    {
      id: "shoots",
      label: "Shoots",
      icon: <Camera className="h-4 w-4 mr-2" />,
    },
    {
      id: "deliverables",
      label: "Deliverables",
      icon: <Image className="h-4 w-4 mr-2" />,
    },
    {
      id: "financials",
      label: "Financials",
      icon: <DollarSign className="h-4 w-4 mr-2" />,
    },
    { id: "crew", label: "Crew", icon: <Users className="h-4 w-4 mr-2" /> },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="h-4 w-4 mr-2" />,
    },
  ];

  // Calculate financial summary
  const totalReceived = booking.receivedAmounts.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const totalExpenses = booking.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const packageCost = Number(booking.packageCost);
  const pendingAmount = packageCost - totalReceived;
  const profit = packageCost - totalExpenses;

  return (
    <div className="h-full flex-1 flex flex-col border-r">
      {/* Fixed Header */}
      <div ref={headerRef} className="border-b bg-white z-10">
        <div className="p-6 space-y-6">
          {/* Booking Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {booking.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-medium">
                  {booking.bookingTypeValue}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  {booking.packageTypeValue}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {booking.clients.brideName && booking.clients.groomName
                    ? `${booking.clients.brideName} & ${booking.clients.groomName}`
                    : booking.clients.name}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge
                className={cn(
                  "px-3 py-1 capitalize",
                  booking.status === "confirmed" &&
                    "bg-green-100 text-green-800 hover:bg-green-100",
                  booking.status === "pending" &&
                    "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                  booking.status === "canceled" &&
                    "bg-red-100 text-red-800 hover:bg-red-100"
                )}
              >
                {booking.status}
              </Badge>
              <span className="text-sm text-muted-foreground mt-1">
                ID: {booking.id}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex border-t">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors",
                "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Tab Content */}
      <ScrollArea
        className="flex-1"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div className="p-6">
          {activeTab === "shoots" && <BookingShoots shoots={booking.shoots} />}
          {activeTab === "deliverables" && (
            <BookingDeliverables deliverables={booking.deliverables} />
          )}
          {activeTab === "financials" && (
            <BookingFinancials
              packageCost={booking.packageCost}
              receivedAmounts={booking.receivedAmounts}
              paymentSchedules={booking.paymentSchedules}
              expenses={booking.expenses}
            />
          )}
          {activeTab === "crew" && <BookingCrew crew={booking.crews} />}
          {activeTab === "tasks" && <BookingTasks tasks={booking.tasks} />}
        </div>
      </ScrollArea>
    </div>
  );
}
