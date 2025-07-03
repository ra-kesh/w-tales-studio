import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { GlobalSheets } from "./global-sheet";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
	const [session, deviceSessions, organization] = await Promise.all([
		auth.api.getSession({
			headers: await headers(),
		}),
		auth.api.listDeviceSessions({
			headers: await headers(),
		}),
		auth.api.getFullOrganization({
			headers: await headers(),
		}),
	]).catch((e) => {
		console.log(e);
		throw redirect("/sign-in");
	});

	return (
		<SidebarProvider>
			<AppSidebar
				session={JSON.parse(JSON.stringify(session))}
				activeOrganization={JSON.parse(JSON.stringify(organization))}
			/>
			<SidebarInset>
				<SiteHeader sessions={JSON.parse(JSON.stringify(deviceSessions))} />
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
