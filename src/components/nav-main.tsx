"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		items?: {
			title: string;
			url: string;
			isActive?: boolean;
		}[];
	}[];
}) {
	const pathname = usePathname();
	const isUrlActive = (url: string) => pathname.includes(url);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild isActive={isUrlActive(item.url)}>
							<Link prefetch={true} href={item.url} className="font-medium">
								{item.icon && <item.icon className="size-4" />}
								{item.title}
							</Link>
						</SidebarMenuButton>
						{item.items?.length ? (
							<SidebarMenuSub>
								{item.items.map((item) => (
									<SidebarMenuSubItem key={item.title}>
										<SidebarMenuSubButton asChild isActive={isUrlActive(item.url)}>
											<Link prefetch={true} href={item.url}>
												{item.title}
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								))}
							</SidebarMenuSub>
						) : null}
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
