"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Smartphone, Key, Clock, AlertTriangle } from "lucide-react";

const mockSessions = [
  {
    id: 1,
    device: "MacBook Pro",
    location: "Bangalore, India",
    lastActive: "2024-01-20 14:30",
    current: true,
  },
  {
    id: 2,
    device: "iPhone 13",
    location: "Mumbai, India",
    lastActive: "2024-01-19 09:15",
    current: false,
  },
  {
    id: 3,
    device: "Chrome - Windows",
    location: "Delhi, India",
    lastActive: "2024-01-18 16:45",
    current: false,
  },
];

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <Smartphone className="h-5 w-5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate one-time codes
              </p>
            </div>
            <Switch checked={false} />
          </div>

          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <Shield className="h-5 w-5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">SMS Authentication</p>
              <p className="text-sm text-muted-foreground">
                Receive codes via SMS for verification
              </p>
            </div>
            <Switch checked={true} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
          <CardDescription>
            Manage your account password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Input type="password" placeholder="Current Password" />
              <Input type="password" placeholder="New Password" />
              <Input type="password" placeholder="Confirm New Password" />
            </div>
            <Button>Update Password</Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Password Requirements</AlertTitle>
            <AlertDescription>
              Password must be at least 8 characters long and include uppercase,
              lowercase, numbers, and special characters.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.device}</TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>{session.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={session.current ? "default" : "secondary"}>
                      {session.current ? "Current" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={session.current}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage API keys for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Key className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Gallery Integration Key</p>
                <p className="text-sm text-muted-foreground">
                  Used for client gallery access
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Generate New Key
            </Button>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Scheduling API Key</p>
                <p className="text-sm text-muted-foreground">
                  Used for calendar integrations
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Generate New Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
