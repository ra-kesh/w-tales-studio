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
import { useFilteredSidebar } from "@/hooks/use-filtered-sidebar";
import type { ActiveOrganization, Session } from "@/types/auth";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

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
	sessions,
	session,
	activeOrganization,
}: {
	sessions: Session[];
	session: Session | null;
	activeOrganization: ActiveOrganization | null;
}) {
	const { navMainSections, navSecondary } = useFilteredSidebar();
	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<OrganisationSwitcher
					session={session}
					activeOrganization={activeOrganization}
				/>
			</SidebarHeader>
			<SidebarContent className="gap-0">
				<NavMain sections={navMainSections} />
				{/* <NavSecondary items={navSecondary} className="mt-auto" /> */}
			</SidebarContent>

			<SidebarFooter>
				<NavUser sessions={sessions} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
