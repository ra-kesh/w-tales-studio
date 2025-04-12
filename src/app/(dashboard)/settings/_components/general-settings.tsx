"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your preferences for your region.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Language
              <span className="text-red-500">*</span>
            </label>
            <Select defaultValue="en-US">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Timezone
              <span className="text-red-500">*</span>
            </label>
            <Select defaultValue="GMT-4">
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GMT-4">GMT-4:00 - Atlantic Standard Time (AST)</SelectItem>
                <SelectItem value="GMT-5">GMT-5:00 - Eastern Time (ET)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Time Format
              <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
            </label>
            <Select defaultValue="24">
              <SelectTrigger>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Date Format
              <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
            </label>
            <Select defaultValue="DD/MM/YY">
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YY">DD/MM/YY</SelectItem>
                <SelectItem value="MM/DD/YY">MM/DD/YY</SelectItem>
                <SelectItem value="YY/MM/DD">YY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline">Discard</Button>
            <Button>Apply Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}