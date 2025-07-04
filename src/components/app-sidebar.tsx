"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { NavMain } from "@/components/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar-data";
import { useFilteredSidebar } from "@/hooks/use-filtered-sidebar";
import type { ActiveOrganization, Session } from "@/types/auth";
import { NavSecondary } from "./nav-secondary";

const OrganisationSwitcher = dynamic(
	() =>
		import("@/components/organisation-switcher").then(
			(mod) => mod.OrganisationSwitcher,
		),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center p-2">
				<div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg" />
				<div className="ml-2 flex-1 space-y-1">
					<div className="h-4 w-24 bg-muted rounded" />
				</div>
				<Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />
			</div>
		),
	},
);

export function AppSidebar({
	session,
	activeOrganization,
}: {
	session: Session | null;
	activeOrganization: ActiveOrganization | null;
}) {
	const { navMain, navSecondary } = useFilteredSidebar();

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<div className="grid flex-1 text-left text-md leading-tight pl-2">
					<span className="truncate font-bold">
						{activeOrganization?.name ?? "Personal Studio"}
					</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
				<NavSecondary items={navSecondary} className="mt-auto" />
			</SidebarContent>

			{/* <SidebarFooter>
				<OrganisationSwitcher
					session={session}
					activeOrganization={activeOrganization}
				/>
			</SidebarFooter> */}
			<SidebarRail />
		</Sidebar>
	);
}
