"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { generateBreadcrumbs } from "@/lib/utils";
import { useSession } from "@/lib/auth/auth-client";
import { NavUser } from "./nav-user";
import type { User } from "@/lib/db/schema";
import type { Session } from "@/types/auth";

// Define page metadata for different routes
const pageMetadata: Record<string, { title: string; description?: string }> = {
	"/home": { title: "Home", description: "Welcome to your studio" },
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
	// Add this new entry for the dynamic edit route
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
	"/configurations": {
		title: "Configurations",
		description: "Configure your studio offerings",
	},
};

export function SiteHeader({
	sessions,
}: {
	sessions: Session[];
}) {
	const pathname = usePathname();
	// const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

	// Get the current page metadata
	const getPageMetadata = () => {
		// First try exact match
		if (pageMetadata[pathname]) {
			return pageMetadata[pathname];
		}

		// Special case for dynamic routes with IDs
		const editBookingRegex = /^\/bookings\/edit\/\d+$/;
		if (editBookingRegex.test(pathname)) {
			return pageMetadata["/bookings/edit/"];
		}

		// Then try to match parent routes
		for (const route in pageMetadata) {
			if (pathname.startsWith(route) && route !== "/") {
				return pageMetadata[route];
			}
		}

		// Default to dashboard if no match
		return pageMetadata["/"];
	};

	const currentPageMetadata = getPageMetadata();
	const { data } = useSession();

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
						<h1 className="text-lg font-semibold">
							{currentPageMetadata.title}
						</h1>
						{currentPageMetadata.description && (
							<p className="text-sm text-muted-foreground">
								{currentPageMetadata.description}
							</p>
						)}
					</div>

					{/* Original breadcrumb code (commented out)
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <BreadcrumbItem key={breadcrumb.href}>
                  {breadcrumb.isLast ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb> */}
				</div>
				<div>
					<NavUser sessions={sessions} />
				</div>
			</div>
		</header>
	);
}
