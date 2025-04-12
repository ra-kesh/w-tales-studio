"use client";

import { motion } from "framer-motion";
import { Camera, Calendar, Package, Wallet } from "lucide-react";
import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  {
    title: "Monthly Revenue",
    value: 285000,
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    prefix: "₹",
  },
  {
    title: "Upcoming Shoots",
    value: 24,
    change: "+3",
    trend: "up",
    icon: Camera,
  },
  {
    title: "Bookings This Month",
    value: 18,
    change: "+2",
    trend: "up",
    icon: Calendar,
  },
  {
    title: "Pending Deliveries",
    value: 8,
    change: "-2",
    trend: "down",
    icon: Package,
  },
];

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <span
                  className={`text-sm font-medium ${
                    metric.trend === "up"
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-bold">
                    {metric.prefix}
                    <CountUp
                      end={metric.value}
                      separator=","
                      duration={2}
                      decimals={metric.prefix ? 0 : 0}
                    />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}