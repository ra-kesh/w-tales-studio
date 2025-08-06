"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Session } from "@/types/auth";
import NewActionSwitcher from "./new-action-switcher";

const pageMetadata: Record<string, { title: string; description?: string }> = {
	"/home": { title: "Home", description: "Welcome to StudioPlus" },
	"/dashboard": { title: "Dashboard", description: "Overview of your studio" },
	"/bookings": {
		title: "Bookings",
		description: "Manage all your client bookings",
	},
	"/bookings/add": {
		title: "Add Booking",
		description: "Create a new booking",
	},
	"/bookings/edit": {
		title: "Edit Booking",
		description: "Update booking details",
	},
	"/bookings/edit/": {
		title: "Edit Booking",
		description: "Update booking details",
	},
	"/shoots": {
		title: "Shoots",
		description: "Schedule and manage photo shoots",
	},
	"/deliverables": {
		title: "Deliverables",
		description: "Track client deliverables",
	},
	"/tasks": { title: "Tasks", description: "Manage your team's tasks" },
	"/crew": { title: "Crew", description: "Manage your photography team" },
	"/clients": { title: "Clients", description: "View and manage your clients" },
	"/settings": {
		title: "Settings",
		description: "Configure your studio settings",
	},
	"/expenses": {
		title: "Expenses",
		description: "Track and manage project-related expenses",
	},
	"/payments": {
		title: "Payments",
		description: "Keep track of past and upcoming payments",
	},
	"/configurations": {
		title: "Configurations",
		description: "Configure your studio offerings",
	},
	"/reviews": {
		title: "Reviews",
		description: "Keep track of review queue",
	},
};

export function SiteHeader({ sessions }: { sessions: Session[] }) {
	const pathname = usePathname();

	const getPageMetadata = () => {
		if (pageMetadata[pathname]) {
			return pageMetadata[pathname];
		}

		const editBookingRegex = /^\/bookings\/edit\/\d+$/;

		if (editBookingRegex.test(pathname)) {
			return pageMetadata["/bookings/edit/"];
		}

		for (const route in pageMetadata) {
			if (pathname.startsWith(route) && route !== "/") {
				return pageMetadata[route];
			}
		}

		return pageMetadata["/"];
	};

	const currentPageMetadata = getPageMetadata();

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 justify-between">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<div className="flex flex-col">
						<h1 className="text-md font-medium">
							{currentPageMetadata?.title ?? ""}
						</h1>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<NewActionSwitcher />
				</div>
			</div>
		</header>
	);
}
