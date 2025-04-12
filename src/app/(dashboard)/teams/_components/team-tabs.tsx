"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamTable } from "./team-table";
import { useTeamMembers } from "@/hooks/use-team";

export function TeamTabs() {
  const { data: members = [] } = useTeamMembers();

  const assigned = members.filter((member) => member.assigned_shoots > 0);
  const unassigned = members.filter((member) => member.assigned_shoots === 0);

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All Members ({members.length})</TabsTrigger>
        <TabsTrigger value="assigned">Assigned ({assigned.length})</TabsTrigger>
        <TabsTrigger value="unassigned">
          Available ({unassigned.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <TeamTable data={members} />
      </TabsContent>
      <TabsContent value="assigned">
        <TeamTable data={assigned} />
      </TabsContent>
      <TabsContent value="unassigned">
        <TeamTable data={unassigned} />
      </TabsContent>
    </Tabs>
  );
}
