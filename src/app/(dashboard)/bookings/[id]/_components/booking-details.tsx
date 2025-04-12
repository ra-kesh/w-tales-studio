"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingOverview } from "./booking-overview";
import { BookingShoots } from "./booking-shoots";
import { BookingDeliverables } from "./booking-deliverables";
import { BookingFinancials } from "./booking-financials";
import { BookingCrew } from "./booking-crew";
import { BookingTasks } from "./booking-tasks";
import type {
  Booking,
  Crew,
  Deliverable,
  Expense,
  PaymentSchedule,
  ReceivedAmount,
  Shoot,
  Task,
} from "@/lib/db/schema";

export type BookingDetail = Booking & {
  shoots: Shoot[];
  deliverables: Deliverable[];
  receivedAmounts: ReceivedAmount[];
  paymentSchedules: PaymentSchedule[];
  expenses: Expense[];
  crews: Crew[];
  tasks: Task[];
};

export function BookingDetails({ booking }: { booking: BookingDetail }) {
  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{booking.name}</h2>
          <p className="text-muted-foreground">
            {booking.bookingType} - {booking.packageType}
          </p>
        </div>
      </div>

      <BookingOverview booking={booking} />

      <Tabs defaultValue="shoots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shoots">Shoots</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="shoots" className="space-y-4">
          <BookingShoots shoots={booking.shoots} />
        </TabsContent>
        <TabsContent value="deliverables" className="space-y-4">
          <BookingDeliverables deliverables={booking.deliverables} />
        </TabsContent>
        <TabsContent value="financials" className="space-y-4">
          <BookingFinancials
            packageCost={booking.packageCost}
            receivedAmounts={booking.receivedAmounts}
            paymentSchedules={booking.paymentSchedules}
            expenses={booking.expenses}
          />
        </TabsContent>
        <TabsContent value="crew" className="space-y-4">
          <BookingCrew crew={booking.crews} />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <BookingTasks tasks={booking.tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
