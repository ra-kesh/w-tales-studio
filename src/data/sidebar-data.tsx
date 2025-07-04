import type { LucideIcon } from "lucide-react";
import {
	CameraIcon,
	HelpCircleIcon,
	Home,
	LayoutDashboardIcon,
	Settings2Icon,
	SettingsIcon,
	UsersIcon,
	Wallet2Icon,
} from "lucide-react";
import type { ac } from "@/lib/auth/permission";

// Define a recursive type for our navigation items that includes permissions
export interface NavItemWithPermissions {
	title: string;
	url: string;
	icon: LucideIcon;
	items?: NavItemWithPermissions[];
	permission?: any;
}

interface SidebarData {
	navMain: NavItemWithPermissions[];
	navSecondary: NavItemWithPermissions[];
}

export const sidebarData: SidebarData = {
	navMain: [
		{
			title: "Home",
			url: "/home",
			icon: Home,
			// No permission key means it's visible to everyone
		},
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboardIcon,
			permission: { dashboard: ["read"] },
		},
		{
			title: "Bookings",
			url: "/bookings",
			icon: CameraIcon,
			permission: { booking: ["list"] },
			items: [
				{
					title: "Shoots",
					url: "/shoots",
					icon: CameraIcon, // Icons for sub-items can be useful
					permission: { shoot: ["list"] },
				},
				{
					title: "Deliverables",
					url: "/deliverables",
					icon: CameraIcon,
					permission: { deliverable: ["list"] },
				},
				{
					title: "Tasks",
					url: "/tasks",
					icon: CameraIcon,
					permission: { task: ["list"] },
				},
				{
					title: "Expenses",
					url: "/expenses",
					icon: CameraIcon,
					permission: { expense: ["list"] },
				},
				{
					title: "Clients",
					url: "/clients",
					icon: CameraIcon,
					permission: { client: ["list"] },
				},
			],
		},
		{
			title: "Payments",
			url: "/payments",
			icon: Wallet2Icon,
			permission: { payment: ["list"] },
		},
		{
			title: "Crews",
			url: "/crews",
			icon: UsersIcon,
			permission: { crew: ["list"] },
		},
		{
			title: "Configurations",
			url: "/configurations",
			icon: Settings2Icon,
			permission: { configuration: ["list"] },
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "/settings",
			icon: SettingsIcon,
			// Public for all logged-in users
		},
		{
			title: "Get Help",
			url: "#",
			icon: HelpCircleIcon,
			// Public for all logged-in users
		},
	],
};
