import type { LucideIcon } from "lucide-react";
import {
	BanknoteIcon,
	CameraIcon,
	DockIcon,
	HelpCircleIcon,
	Home,
	LayoutDashboardIcon,
	ListTodoIcon,
	PackageIcon,
	Settings2Icon,
	SettingsIcon,
	SquareUserRoundIcon,
	UsersIcon,
	Wallet2Icon,
} from "lucide-react";

export interface NavItemWithPermissions {
	title: string;
	url: string;
	icon: LucideIcon;
	permission?: any;
}

export interface NavSection {
	label: string | null; // Label can be null for items without a heading
	items: NavItemWithPermissions[];
}

interface SidebarData {
	navMain: NavSection[];
	navSecondary: NavItemWithPermissions[];
}

export const sidebarData: SidebarData = {
	navMain: [
		{
			label: null,
			items: [
				{ title: "Home", url: "/home", icon: Home },
				{
					title: "Dashboard",
					url: "/dashboard",
					icon: LayoutDashboardIcon,
					permission: { dashboard: ["read"] },
				},
			],
		},
		{
			label: "Platform",
			items: [
				{
					title: "Bookings",
					url: "/bookings",
					icon: DockIcon,
					permission: { booking: ["list"] },
				},
				{
					title: "Shoots",
					url: "/shoots",
					icon: CameraIcon,
					permission: { shoot: ["list"] },
				},
				{
					title: "Deliverables",
					url: "/deliverables",
					icon: PackageIcon,
					permission: { deliverable: ["list"] },
				},
				{
					title: "Tasks",
					url: "/tasks",
					icon: ListTodoIcon,
					permission: { task: ["list"] },
				},
				{
					title: "Expenses",
					url: "/expenses",
					icon: BanknoteIcon,
					permission: { expense: ["list"] },
				},
				{
					title: "Payments",
					url: "/payments",
					icon: Wallet2Icon,
					permission: { payment: ["list"] },
				},
				{
					title: "Clients",
					url: "/clients",
					icon: SquareUserRoundIcon,
					permission: { client: ["list"] },
				},
				{
					title: "Crews",
					url: "/crews",
					icon: UsersIcon,
					permission: { crew: ["list"] },
				},
			],
		},

		{
			label: "System",
			items: [
				{
					title: "Configurations",
					url: "/configurations/packages",
					icon: Settings2Icon,
					permission: { configuration: ["list"] },
				},
				{
					title: "Settings",
					url: "/settings/profile",
					icon: SettingsIcon,
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Get Help",
			url: "#",
			icon: HelpCircleIcon,
		},
	],
};
