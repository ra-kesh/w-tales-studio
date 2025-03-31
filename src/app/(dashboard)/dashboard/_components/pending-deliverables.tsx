"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Deliverable } from "@/lib/db/schema";

async function fetchPendingDeliverables() {
  const response = await fetch("/api/dashboard/pending-deliverables");
  if (!response.ok) throw new Error("Failed to fetch pending deliverables");
  return response.json();
}

export function PendingDeliverables() {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-deliverables"],
    queryFn: fetchPendingDeliverables,
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Pending Deliverables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            data?.deliverables.map((deliverable: Deliverable) => (
              <div key={deliverable.id} className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {deliverable.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due{" "}
                    {deliverable.dueDate
                      ? format(new Date(deliverable.dueDate), "MMM dd, yyyy")
                      : "No due date"}
                  </p>
                </div>
                <div className="ml-auto">
                  {deliverable.dueDate &&
                  new Date(deliverable.dueDate) < new Date() ? (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
