"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Package,
  Receipt,
  ArrowUpCircle,
  Download,
} from "lucide-react";

const mockInvoices = [
  { id: "INV-001", date: "2024-01-20", amount: "₹29,999", status: "paid" },
  { id: "INV-002", date: "2023-12-20", amount: "₹29,999", status: "paid" },
  { id: "INV-003", date: "2023-11-20", amount: "₹29,999", status: "paid" },
];

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Professional Plan</h3>
              <p className="text-sm text-muted-foreground">₹29,999/month</p>
            </div>
            <Button>Upgrade Plan</Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Usage</span>
              <span>75GB of 100GB</span>
            </div>
            <Progress value={75} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Active Projects</span>
              </div>
              <p className="mt-2 text-2xl font-bold">24/30</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Monthly Uploads</span>
              </div>
              <p className="mt-2 text-2xl font-bold">2.1K/3K</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment details and billing address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-lg border p-4">
            <CreditCard className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 04/2024</p>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Billing Address</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pixel Perfect Studios
              <br />
              123 Creative Avenue
              <br />
              Bangalore, Karnataka 560001
              <br />
              India
            </p>
            <Button variant="link" size="sm" className="mt-2 px-0">
              Edit Address
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="default">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
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
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Customize your invoice preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Receipt className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Automatic Invoicing</p>
                <p className="text-sm text-muted-foreground">
                  Generate and send invoices automatically
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
