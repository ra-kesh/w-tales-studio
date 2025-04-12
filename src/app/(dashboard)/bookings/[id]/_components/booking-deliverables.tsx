"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Package2 } from "lucide-react";
import type { Deliverable } from "@/lib/db/schema";

export function BookingDeliverables({
  deliverables,
}: {
  deliverables: Deliverable[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {deliverables.map((deliverable) => (
        <Card key={deliverable.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{deliverable.title}</span>
              <Package2 className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  deliverable.isPackageIncluded ? "default" : "secondary"
                }
              >
                {deliverable.isPackageIncluded ? "Package Included" : "Add-on"}
              </Badge>
              {deliverable.cost && (
                <span className="font-medium">
                  ${Number(deliverable.cost).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Due:{" "}
                  {format(
                    new Date(deliverable.dueDate as string),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
              <span>Quantity: {deliverable.quantity}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
