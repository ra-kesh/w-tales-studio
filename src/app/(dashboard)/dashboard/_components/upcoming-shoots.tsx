"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Shoot } from "@/lib/db/schema";

async function fetchUpcomingShoots() {
  const response = await fetch("/api/dashboard/upcoming-shoots");
  if (!response.ok) throw new Error("Failed to fetch upcoming shoots");
  return response.json();
}

export function UpcomingShoots() {
  const { data, isLoading } = useQuery({
    queryKey: ["upcoming-shoots"],
    queryFn: fetchUpcomingShoots,
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Upcoming Shoots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            data?.shoots.map((shoot: Shoot) => (
              <div key={shoot.id} className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {/* {shoot.bookingName} */}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shoot.date
                      ? format(new Date(shoot.date), "MMM dd, yyyy")
                      : "No date"}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {shoot.venue || "No venue"}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
