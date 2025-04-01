"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, MapPin, Calendar, Camera } from "lucide-react";
import type { Shoot } from "@/lib/db/schema";

export function BookingShoots({ shoots }: { shoots: Shoot[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shoots.map((shoot) => (
        <Card key={shoot.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{shoot.title}</span>
              <Camera className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(shoot.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{shoot.reportingTime}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div>{shoot.venue}</div>
                <div className="text-sm text-muted-foreground">{shoot.city}</div>
              </div>
            </div>
            {shoot.notes && (
              <div className="text-sm">
                <span className="font-medium">Notes: </span>
                {shoot.notes}
              </div>
            )}
            {shoot.additionalServices?.length > 0 && (
              <div>
                <span className="text-sm font-medium">Additional Services: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {shoot.additionalServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}