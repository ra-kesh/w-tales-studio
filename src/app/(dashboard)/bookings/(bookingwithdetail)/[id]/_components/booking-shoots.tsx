"use client";

import * as React from "react";
import { Fragment } from "react";
import type { Shoot } from "@/lib/db/schema";
import { format, isPast } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  LocateFixedIcon,
  LocateIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BookingShootsProps {
  shoots: Shoot[];
}

// Reusable component for displaying shoots
function ShootsList({
  shoots,
  isFinished = false,
}: {
  shoots: Shoot[];
  isFinished?: boolean;
}) {
  const groupedShoots = shoots.reduce(
    (acc, shoot) => {
      const shootDate = shoot.date ? new Date(shoot.date as string) : null;
      const dateKey = shootDate ? format(shootDate, "yyyy-MM-dd") : "No Date";
      const displayDate = shootDate
        ? format(shootDate, "MMMM d, yyyy")
        : "No Date";

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: displayDate,
          dateTime: dateKey,
          shoots: [],
        };
      }

      acc[dateKey].shoots.push(shoot);
      return acc;
    },
    {} as Record<string, { date: string; dateTime: string; shoots: Shoot[] }>
  );

  // Sort dates (ascending for upcoming, descending for finished)
  const sortedDates = Object.values(groupedShoots).sort((a, b) =>
    isFinished
      ? b.dateTime.localeCompare(a.dateTime)
      : a.dateTime.localeCompare(b.dateTime)
  );

  if (shoots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isFinished ? "No finished shoots yet" : "No upcoming shoots scheduled"}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left">
        <thead className="sr-only">
          <tr>
            <th>Name</th>
            <th className="hidden sm:table-cell">Location</th>
            <th>Date</th>
            <th>Crew</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((day) => (
            <Fragment key={day.dateTime}>
              <tr className="text-sm leading-6 text-gray-900">
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="relative isolate py-2 px-4 font-semibold"
                >
                  <time dateTime={day.dateTime}>{day.date}</time>
                  <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                  <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                </th>
              </tr>
              {day.shoots.map((shoot) => (
                <React.Fragment key={shoot.id}>
                  <tr>
                    <td className="relative py-5 px-4">
                      <div className="flex gap-x-6">
                        <div className="flex-auto">
                          <div className="flex flex-col items-start gap-3">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium leading-6 text-gray-900">
                                {shoot.title || "Untitled Shoot"}
                              </div>
                              {isFinished && (
                                <div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Completed
                                </div>
                              )}
                            </div>
                            <div className="flex gap-4">
                              <div className="text-sm leading-6 text-gray-900">
                                {(shoot.location as string) || "No location"}
                              </div>
                              <div className="flex justify-end items-center">
                                {isFinished ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                )}
                                <span className="text-sm text-gray-500">
                                  {shoot.date
                                    ? format(
                                        new Date(shoot.date as string),
                                        "h:mm a"
                                      )
                                    : "No time"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                      <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                    </td>

                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center gap-2 justify-self-end">
                        {shoot.shootsAssignments &&
                        shoot.shootsAssignments.length ? (
                          <>
                            <div className="flex -space-x-1">
                              {shoot.shootsAssignments
                                .slice(0, 3)
                                .map((assignment) => {
                                  const name =
                                    assignment.crew.member?.user?.name ||
                                    assignment.crew.name;
                                  const initials = name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("");

                                  return (
                                    <Avatar
                                      key={assignment.id}
                                      className="h-8 w-8 border-2 border-background"
                                    >
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                  );
                                })}
                            </div>
                            {shoot.shootsAssignments.length > 3 && (
                              <Badge
                                variant="secondary"
                                className="rounded-full"
                              >
                                +{shoot.shootsAssignments.length - 3}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No crew assigned
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BookingShoots({ shoots }: BookingShootsProps) {
  // Separate shoots into upcoming and finished based on date
  const upcomingShoots = shoots.filter(
    (shoot) => !isPast(new Date(shoot.date as string))
  );

  const finishedShoots = shoots.filter((shoot) =>
    isPast(new Date(shoot.date as string))
  );

  // Calculate completion percentage
  const completionPercentage =
    shoots.length > 0
      ? Math.round((finishedShoots.length / shoots.length) * 100)
      : 0;

  return (
    <Card className="px-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Shoots</CardTitle>
        <div className="flex items-center gap-2 w-48">
          <Progress value={completionPercentage} className="h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {completionPercentage}% Complete
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingShoots.length})
            </TabsTrigger>
            <TabsTrigger value="finished">
              Finished ({finishedShoots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <ShootsList shoots={upcomingShoots} isFinished={false} />
          </TabsContent>

          <TabsContent value="finished">
            <ShootsList shoots={finishedShoots} isFinished={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
