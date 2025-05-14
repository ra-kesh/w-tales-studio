"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Crew } from "@/lib/db/schema";

export function BookingCrew({ crew }: { crew: Crew[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {crew.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{member.freelancerName}</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{member.role}</span>
              {member.isLead && (
                <Badge variant="default">Lead</Badge>
              )}
            </div>
            {member.userId && (
              <div className="text-sm text-muted-foreground">
                Internal Team Member
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}