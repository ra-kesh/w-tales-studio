"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export function Announcements() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Studio Announcements
          </CardTitle>
          <CardDescription>
            Important updates and announcements for your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">New Feature</Badge>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
            <h3 className="font-medium">Enhanced Booking Management</h3>
            <p className="text-sm text-muted-foreground">
              We've added new features to help you manage your bookings more efficiently, including automated reminders and client communication tools.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Update</Badge>
              <span className="text-xs text-muted-foreground">1 week ago</span>
            </div>
            <h3 className="font-medium">System Maintenance Complete</h3>
            <p className="text-sm text-muted-foreground">
              Our scheduled maintenance has been completed. All systems are now running optimally with improved performance.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive">Important</Badge>
              <span className="text-xs text-muted-foreground">2 weeks ago</span>
            </div>
            <h3 className="font-medium">Backup Your Data</h3>
            <p className="text-sm text-muted-foreground">
              Remember to regularly backup your important project files and client data. Use our integrated backup tools for seamless protection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}