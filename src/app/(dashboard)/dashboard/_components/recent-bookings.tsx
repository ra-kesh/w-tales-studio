"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Booking } from "@/lib/db/schema";

async function fetchRecentBookings() {
  const response = await fetch("/api/dashboard/recent-bookings");
  if (!response.ok) throw new Error("Failed to fetch recent bookings");
  return response.json();
}

export function RecentBookings() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-bookings"],
    queryFn: fetchRecentBookings,
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            data?.bookings.map((booking: Booking) => (
              <div key={booking.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {booking.brideName[0]}
                    {booking.groomName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {booking.brideName} & {booking.groomName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(booking.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  ${Number(booking.totalAmount).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
