"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/db/schema";

export function BookingTasks({ tasks }: { tasks: Task[] }) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{task.title}</span>
              {getStatusIcon(task.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {task.description}
                </div>
                {task.assignedTo && (
                  <div className="text-sm">
                    Assigned to:{" "}
                    <span className="font-medium">{task.assignedTo}</span>
                  </div>
                )}
              </div>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>Priority: {task.priority}</div>
              {task.dueDate && (
                <div>Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}</div>
              )}
            </div>
            {task.deliverableId && (
              <div className="text-sm text-muted-foreground">
                Related to: {task.deliverable?.title}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
