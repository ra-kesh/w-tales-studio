"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isAfter,
  isPast,
} from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  Tag,
  ArrowUp,
  ArrowDown,
  Edit,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTaskParams } from "@/hooks/use-task-params";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tasksWithAssignments } from "@/types/booking";

export function BookingTasks({ tasks }: { tasks: tasksWithAssignments[] }) {
  const { setParams } = useTaskParams();
  const [activeTab, setActiveTab] = useState("all");

  // Helper function to get status groups
  const getStatusGroups = () => {
    const groups: Record<string, tasksWithAssignments[]> = {};
    tasks?.forEach((task) => {
      const status = task.status || "todo";
      if (!groups[status]) groups[status] = [];
      groups[status].push(task);
    });
    return groups;
  };

  // Helper function to get priority groups
  const getPriorityGroups = () => {
    const groups: Record<string, tasksWithAssignments[]> = {};
    tasks?.forEach((task) => {
      const priority = task.priority || "medium";
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(task);
    });
    return groups;
  };

  // Helper function to get due date groups - improved logic
  const getDueDateGroups = () => {
    const groups: Record<string, tasksWithAssignments[]> = {
      Today: [],
      Tomorrow: [],
      "This Week": [],
      Upcoming: [],
      Overdue: [],
      "No Due Date": [],
      Completed: [],
    };

    tasks?.forEach((task) => {
      // First check if task is completed, regardless of due date
      if (task.status === "completed") {
        groups["Completed"].push(task);
        return;
      }

      if (!task.dueDate) {
        groups["No Due Date"].push(task);
        return;
      }

      const dueDate = new Date(task.dueDate);
      if (isToday(dueDate)) groups["Today"].push(task);
      else if (isTomorrow(dueDate)) groups["Tomorrow"].push(task);
      else if (isThisWeek(dueDate)) groups["This Week"].push(task);
      else if (isAfter(dueDate, new Date())) groups["Upcoming"].push(task);
      else groups["Overdue"].push(task);
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, tasks]) => tasks.length > 0)
    );
  };

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!tasks || tasks.length === 0) return 0;

    return Math.round((completedTasks / tasks.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  const handleEditTask = (taskId: number) => {
    setParams({ taskId: taskId.toString() });
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">Medium</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            In Progress
          </Badge>
        );
      case "todo":
        return <Badge variant="outline">Todo</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Todo</Badge>;
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "low":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <ArrowUp className="h-4 w-4 text-amber-500 rotate-90" />;
    }
  };

  // Render task card
  const renderTaskCard = (task: tasksWithAssignments) => {
    return (
      <div
        key={task.id}
        className="border rounded-md p-4 mb-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium">{task.description}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {getPriorityBadge(task.priority || "medium")}
              {getStatusBadge(task.status || "todo")}
              {task.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), "MMM dd, yyyy")}
                </div>
              )}
            </div>

            {task.tasksAssignments?.length > 0 && (
              <div className="mt-3">
                {/* <div className="text-xs font-medium text-muted-foreground mb-2">
									Assigned to
								</div> */}
                <div className="gap-4 flex ">
                  {task.tasksAssignments.map((assignment) => {
                    const name =
                      assignment.crew?.member?.user?.name ||
                      assignment.crew?.name ||
                      "Unnamed";
                    const initials = name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("");

                    return (
                      <div
                        key={assignment.crew?.id}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{name}</span>
                        {/* {assignment.isLead && (
                          <Badge
                            variant="outline"
                            className="text-xs h-5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Lead
                          </Badge>
                        )} */}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2"
            onClick={() => handleEditTask(task.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit task</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setParams({
              createTask: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completionPercentage}% completed</span>
              <span>
                {completedTasks}/{tasks.length} tasks
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
          <TabsTrigger value="dueDate">By Due Date</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {tasks?.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-muted/50">
                <Tag className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-sm">All Tasks</h3>
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {tasks.length}
                </Badge>
              </div>
              <div className="p-3">
                {tasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 border rounded-md">
              <div className="text-muted-foreground mb-2">No tasks found</div>
              <Button
                onClick={() =>
                  setParams({
                    createTask: true,
                  })
                }
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first task
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="status" className="mt-0 space-y-6">
          {Object.entries(getStatusGroups()).map(([status, statusTasks]) => (
            <div key={status} className="border rounded-md overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-muted/50">
                {status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {status === "in_progress" && (
                  <Clock className="h-4 w-4 text-blue-500" />
                )}
                {status === "cancelled" && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {status === "todo" && <Tag className="h-4 w-4 text-gray-500" />}
                <h3 className="font-medium text-sm">
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </h3>
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {statusTasks.length}
                </Badge>
              </div>
              <div className="p-3">
                {statusTasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="priority" className="mt-0 space-y-6">
          {Object.entries(getPriorityGroups()).map(
            ([priority, priorityTasks]) => (
              <div key={priority} className="border rounded-md overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-muted/50">
                  {getPriorityIcon(priority)}
                  <h3 className="font-medium text-sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}{" "}
                    Priority
                  </h3>
                  <Badge
                    variant="outline"
                    className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {priorityTasks.length}
                  </Badge>
                </div>
                <div className="p-3">
                  {priorityTasks.map((task) => renderTaskCard(task))}
                </div>
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="dueDate" className="mt-0 space-y-6">
          {Object.entries(getDueDateGroups()).map(([dateGroup, dateTasks]) => (
            <div key={dateGroup} className="border rounded-md overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-muted/50">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-sm">{dateGroup}</h3>
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {dateTasks.length}
                </Badge>
              </div>
              <div className="p-3">
                {dateTasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
