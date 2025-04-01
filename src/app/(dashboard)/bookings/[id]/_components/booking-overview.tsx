"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Package } from "lucide-react";
import type { Booking } from "@/lib/db/schema";

export function BookingOverview({ booking }: { booking: Booking }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Client Details</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {booking.clients.brideName} & {booking.clients.groomName}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.clients.email}
            <br />
            {booking.clients.phoneNumber}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Package Details</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${Number(booking.packageCost).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.packageType}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Event Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format(new Date(booking.shoots[0]?.date || booking.createdAt), "MMM dd, yyyy")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.shoots[0]?.time || "Time TBD"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Location</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {booking.shoots[0]?.city || "TBD"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.shoots[0]?.venue || "Venue TBD"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}