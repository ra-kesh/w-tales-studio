"use client";

import { motion } from "framer-motion";
import { Calendar, DollarSign, Wallet, BookOpen } from "lucide-react";
import CountUp from "react-countup";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BookingStats as BookingStatsType } from "@/lib/db/queries";

export function BookingStats({
  initialStats,
}: {
  initialStats: BookingStatsType;
}) {
  const metrics = [
    {
      title: "Total Bookings",
      value: initialStats?.totalBookings || 0,
      icon: BookOpen,
    },
    {
      title: "Active Bookings",
      value: initialStats?.activeBookings || 0,
      icon: Calendar,
    },
    {
      title: "Total Expenses",
      value: initialStats?.totalExpenses || 0,
      icon: Wallet,
      prefix: "₹",
    },
    {
      title: "Total Revenue",
      value: initialStats?.totalRevenue || 0,
      icon: DollarSign,
      prefix: "₹",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CardContent
            className={cn(index < metrics.length - 1 ? "border-r" : "")}
          >
            <div className="">
              <h3 className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold">
                  {metric.prefix || ""}
                  {!initialStats ? (
                    <span className="text-muted-foreground">...</span>
                  ) : (
                    <CountUp
                      end={metric.value}
                      separator=","
                      duration={2}
                      decimals={metric.prefix ? 2 : 0}
                    />
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </motion.div>
      ))}
    </div>
  );
}
