import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { GlobalSheets } from "./global-sheet";
import { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <GlobalSheets />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
