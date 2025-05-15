"use client";

import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  ChevronRight
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Shoot } from "@/lib/db/schema";
import { format } from "date-fns";

interface BookingShootsProps {
  shoots: Shoot[];
}

export function BookingShoots({ shoots }: BookingShootsProps) {
  if (!shoots.length) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">No shoots scheduled</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Scheduled Shoots</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Crew</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shoots.map((shoot) => {
              const date = shoot.date ? new Date(shoot.date) : null;
              const formattedDate = date ? format(date, "MMM dd, yyyy") : "Not scheduled";
              
              return (
                <TableRow key={shoot.id}>
                  <TableCell className="font-medium">{shoot.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formattedDate}</span>
                      {shoot.time && (
                        <>
                          <Clock className="h-4 w-4 ml-4 mr-2 text-muted-foreground" />
                          <span>{shoot.time}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {shoot.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{shoot.location as string}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {shoot.shootsAssignments?.slice(0, 3).map((assignment) => (
                        <Avatar key={assignment.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage 
                            src={assignment.crew.member?.user?.image || ""} 
                            alt={assignment.crew.name} 
                          />
                          <AvatarFallback className="text-xs">
                            {assignment.crew.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {shoot.shootsAssignments && shoot.shootsAssignments.length > 3 && (
                        <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                          <AvatarFallback className="text-xs">
                            +{shoot.shootsAssignments.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
