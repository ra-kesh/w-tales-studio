"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

export function RecentUpdates() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Updates
          </CardTitle>
          <CardDescription>
            Latest activities and changes in your studio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">John Doe</span> completed editing for{" "}
                <span className="font-medium">Smith Wedding</span>
              </p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/02.png" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Sarah Miller</span> uploaded deliverables for{" "}
                <span className="font-medium">Corporate Event</span>
              </p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/03.png" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Mike Johnson</span> created new booking{" "}
                <span className="font-medium">Anniversary Shoot</span>
              </p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/04.png" />
              <AvatarFallback>LW</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Lisa Wang</span> scheduled shoot for{" "}
                <span className="font-medium">Product Photography</span>
              </p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}