import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal } from "lucide-react";

interface TeamTableProps {
  data: any[];
}

export function TeamTable({ data }: TeamTableProps) {
  return (
    <Table className="border-t">
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Specialization</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Shoots</TableHead>
          <TableHead>Equipment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{member.role}</Badge>
            </TableCell>
            <TableCell>{member.specialization}</TableCell>
            <TableCell>
              <Badge
                variant={member.status === "active" ? "default" : "secondary"}
              >
                {member.status}
              </Badge>
            </TableCell>
            <TableCell>{member.assigned_shoots}</TableCell>
            <TableCell>
              <div className="space-y-1">
                {member.equipment.map((item: string, i: number) => (
                  <div key={i} className="text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
