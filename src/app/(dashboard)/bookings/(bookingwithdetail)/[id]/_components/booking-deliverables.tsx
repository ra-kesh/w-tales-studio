"use client";

import { Fragment, useState } from "react";
import type { Deliverable } from "@/lib/db/schema";
import { format } from "date-fns";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  Edit,
  Plus,
  DollarSign,
  Users,
  Tag,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { cn } from "@/lib/utils";

interface BookingDeliverablesProps {
  deliverables: Deliverable[];
  bookingId?: string | number;
}

// Reusable component for displaying deliverables
function DeliverablesList({
  deliverables,
  isDelivered = false,
  bookingId,
}: {
  deliverables: Deliverable[];
  isDelivered?: boolean;
  bookingId?: string | number;
}) {
  const [expandedDeliverables, setExpandedDeliverables] = useState<
    Record<string, boolean>
  >({});

  const { setParams } = useDeliverableParams();

  const toggleExpanded = (
    deliverableId: number | string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setExpandedDeliverables((prev) => ({
      ...prev,
      [deliverableId]: !prev[deliverableId],
    }));
  };

  if (deliverables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isDelivered
          ? "No delivered deliverables yet"
          : "No pending deliverables scheduled"}
      </div>
    );
  }

  // Group deliverables by status
  const groupedDeliverables = deliverables.reduce((acc, deliverable) => {
    const status = deliverable.status || "pending";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(deliverable);
    return acc;
  }, {} as Record<string, Deliverable[]>);

  // Define status display names and order
  const statusOrder = isDelivered
    ? ["delivered"]
    : ["in_progress", "in_revision", "pending", "cancelled", "completed"];

  const statusDisplayNames: Record<string, string> = {
    in_progress: "In Progress",
    pending: "Pending",
    in_revision: "In Revision",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  // Status badge colors
  const statusColors: Record<string, string> = {
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    in_revision: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  // Sort status groups by predefined order
  const sortedStatusGroups = Object.entries(groupedDeliverables).sort(
    ([statusA], [statusB]) => {
      const indexA = statusOrder.indexOf(statusA);
      const indexB = statusOrder.indexOf(statusB);

      // If both statuses are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one status is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither status is in the order array, sort alphabetically
      return statusA.localeCompare(statusB);
    }
  );

  return (
    <div className="overflow-hidden space-y-6">
      {sortedStatusGroups.map(([status, statusDeliverables]) => (
        <div key={status} className="border rounded-md overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-muted/50">
            <Tag className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-sm">
              {statusDisplayNames[status] || status}
            </h3>
            <Badge
              variant="outline"
              className={cn("ml-2", statusColors[status])}
            >
              {statusDeliverables.length}
            </Badge>
          </div>
          <div className="divide-y">
            {statusDeliverables.map((deliverable) => (
              <div key={deliverable.id} className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium leading-6 text-gray-900">
                          {deliverable.title || "Untitled Deliverable"}
                        </div>
                        {deliverable.dueDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {format(
                              new Date(deliverable.dueDate as string),
                              "MMM d, yyyy"
                            )}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-gray-100 ml-2"
                          onClick={() =>
                            setParams({
                              deliverableId: deliverable.id.toString(),
                            })
                          }
                        >
                          <Edit className="h-3.5 w-3.5 text-gray-500" />
                          <span className="sr-only">Edit deliverable</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        {Number(deliverable.cost) > 0
                          ? `₹${Number(deliverable.cost).toLocaleString()}`
                          : "No additional cost"}
                      </div>
                      <div className="flex items-center justify-end text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1 text-gray-400" />
                        {deliverable.quantity
                          ? `Quantity: ${deliverable.quantity}`
                          : "Quantity: 1"}
                      </div>
                    </div>
                  </div>

                  <div className="w-full border rounded-md p-1">
                    <div
                      onClick={(e) => toggleExpanded(deliverable.id, e)}
                      className="p-2 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Details & Crew
                        </span>
                      </div>
                      {expandedDeliverables[deliverable.id] ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    {expandedDeliverables[deliverable.id] && (
                      <div className="bg-gray-50 rounded-md m-2 p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Title
                            </div>
                            <div className="text-sm">
                              {deliverable.title || "Untitled"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Due Date
                            </div>
                            <div className="text-sm">
                              {deliverable.dueDate
                                ? format(
                                    new Date(deliverable.dueDate as string),
                                    "MMMM d, yyyy"
                                  )
                                : "No due date"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Cost
                            </div>
                            <div className="text-sm">
                              {Number(deliverable.cost) > 0
                                ? `₹${Number(
                                    deliverable.cost
                                  ).toLocaleString()}`
                                : "No additional cost"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Quantity
                            </div>
                            <div className="text-sm">
                              {deliverable.quantity || "1"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Status
                            </div>
                            <div className="text-sm">
                              <Badge
                                variant="outline"
                                className={cn(statusColors[status])}
                              >
                                {statusDisplayNames[status] || status}
                              </Badge>
                            </div>
                          </div>

                          {/* Crew assignments section */}
                          {deliverable.deliverablesAssignments &&
                            deliverable.deliverablesAssignments.length > 0 && (
                              <div className="col-span-2 mt-2">
                                <div className="text-xs text-gray-500 mb-2">
                                  Assigned Crew
                                </div>
                                <div className="space-y-2">
                                  {deliverable.deliverablesAssignments.map(
                                    (assignment) => {
                                      const name =
                                        assignment.crew?.member?.user?.name ||
                                        assignment.crew?.name ||
                                        "Unnamed";
                                      const initials = name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("");

                                      return (
                                        <div
                                          key={assignment.id}
                                          className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
                                        >
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarFallback className="bg-primary/10 text-primary">
                                                {initials}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <div className="font-medium">
                                                {name}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {assignment.crew?.role ||
                                                  "No role"}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center">
                                            {assignment.isLead && (
                                              <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                              >
                                                Lead
                                              </Badge>
                                            )}
                                            {assignment.crew
                                              ?.specialization && (
                                              <div className="ml-2 text-sm text-gray-500">
                                                {assignment.crew.specialization}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          {(!deliverable.deliverablesAssignments ||
                            deliverable.deliverablesAssignments.length ===
                              0) && (
                            <div className="col-span-2 mt-2">
                              <div className="text-xs text-gray-500 mb-2">
                                Assigned Crew
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-2 text-gray-400" />
                                No crew assigned to this deliverable
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingDeliverables({
  deliverables = [],
  bookingId,
}: BookingDeliverablesProps) {
  const { setParams } = useDeliverableParams();

  // Filter deliverables by delivered status
  const undeliveredDeliverables = deliverables.filter(
    (d) => d.status !== "delivered"
  );
  const deliveredDeliverables = deliverables.filter(
    (d) => d.status === "delivered"
  );

  // Calculate delivery percentage
  const deliveryPercentage =
    deliverables.length > 0
      ? Math.round((deliveredDeliverables.length / deliverables.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Deliverables</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setParams({
              createDeliverable: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deliverable
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{deliveryPercentage}% delivered</span>
              <span>
                {deliveredDeliverables.length}/{deliverables.length}{" "}
                deliverables
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${deliveryPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="undelivered" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="undelivered">
            Undelivered ({undeliveredDeliverables.length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({deliveredDeliverables.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="undelivered" className="mt-6">
          <DeliverablesList
            deliverables={undeliveredDeliverables}
            bookingId={bookingId}
          />
        </TabsContent>
        <TabsContent value="delivered" className="mt-6">
          <DeliverablesList
            deliverables={deliveredDeliverables}
            isDelivered
            bookingId={bookingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
