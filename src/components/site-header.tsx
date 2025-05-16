"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { generateBreadcrumbs } from "@/lib/utils";
import { useSession } from "@/lib/auth/auth-client";
import { NavUser } from "./nav-user";
import type { User } from "@/lib/db/schema";

export function SiteHeader() {
	const pathname = usePathname();
	const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

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
					</Breadcrumb>
				</div>
				<div>
					<NavUser user={data?.user as User} />
				</div>
			</div>
		</header>
	);
}
