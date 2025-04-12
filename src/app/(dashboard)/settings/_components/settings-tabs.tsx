"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./general-settings";
// import { ProfileSettings } from "./profile-settings";
// import { CompanySettings } from "./company-settings";
// import { NotificationSettings } from "./notification-settings";
// import { PrivacySettings } from "./privacy-settings";
// import { IntegrationSettings } from "./integration-settings";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="general"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          General Settings
        </TabsTrigger>
        <TabsTrigger
          value="profile"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Profile Settings
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Company Settings
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Notification Settings
        </TabsTrigger>
        <TabsTrigger
          value="privacy"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Privacy & Security
        </TabsTrigger>
        <TabsTrigger
          value="integrations"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Integrations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>
      <TabsContent value="profile">{/* <ProfileSettings /> */}</TabsContent>
      <TabsContent value="company">{/* <CompanySettings /> */}</TabsContent>
      <TabsContent value="notifications">
        {/* <NotificationSettings /> */}
      </TabsContent>
      <TabsContent value="privacy">{/* <PrivacySettings /> */}</TabsContent>
      <TabsContent value="integrations">
        {/* <IntegrationSettings /> */}
      </TabsContent>
    </Tabs>
  );
}
