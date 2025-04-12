"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["photographer", "cinematographer", "editor", "assistant"]),
});

const mockInvites = [
  {
    id: 1,
    email: "sarah@gmail.com",
    role: "photographer",
    status: "pending",
    sent: "2024-01-15",
  },
  {
    id: 2,
    email: "john@gmail.com",
    role: "editor",
    status: "accepted",
    sent: "2024-01-14",
  },
  {
    id: 3,
    email: "mike@gmail.com",
    role: "cinematographer",
    status: "expired",
    sent: "2024-01-10",
  },
];

export function TeamInvites() {
  const form = useForm({
    // resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "photographer",
    },
  });

  const onSubmit = async (data: z.infer<typeof inviteSchema>) => {
    console.log(data);
    // TODO: Implement invite logic
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>
            Send invitations to new team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="team@studio.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="photographer">
                            Photographer
                          </SelectItem>
                          <SelectItem value="cinematographer">
                            Cinematographer
                          </SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Send Invitation</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Manage and track sent invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell className="capitalize">{invite.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invite.status === "accepted"
                          ? "default"
                          : invite.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {invite.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(invite.sent).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {invite.status === "pending" && (
                      <Button variant="ghost" size="sm">
                        Resend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
