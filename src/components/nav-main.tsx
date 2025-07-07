"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavSection } from "@/data/sidebar-data";

export function NavMain({ sections }: { sections: NavSection[] }) {
	const pathname = usePathname();

	const isUrlActive = (url: string) => pathname.includes(url);

	return (
		<>
			{sections.map((section, index) => (
				<SidebarGroup key={section.label || `section-${index}`}>
					{section.label && (
						<SidebarGroupLabel>{section.label}</SidebarGroupLabel>
					)}
					<SidebarMenu>
						{section.items.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isUrlActive(item.url)}
									className="data-[active=true]:text-indigo-600"
								>
									<Link prefetch={true} href={item.url} className="font-medium">
										{item.icon && <item.icon className="size-4" />}
										{item.title}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			))}
		</>
	);
}
