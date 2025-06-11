"use client";

import { NavMain } from "@/components/nav-main";
import { OrganisationSwitcher } from "@/components/organisation-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

import { sidebarData } from "@/data/sidebar-data";
import { NavSecondary } from "./nav-secondary";
import type { ActiveOrganization, Session } from "@/types/auth";

export function AppSidebar({
	session,
	activeOrganization,
}: {
	session: Session | null;
	activeOrganization: ActiveOrganization | null;
}) {
	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<div className="grid flex-1 text-left text-md leading-tight pl-2">
					<span className="truncate font-bold">Studio Plus</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={sidebarData.navMain} />
				<NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
			</SidebarContent>

			<SidebarFooter>
				<OrganisationSwitcher
					session={session}
					activeOrganization={activeOrganization}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
