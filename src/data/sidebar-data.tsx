import type { LucideIcon } from "lucide-react";
import {
	BanknoteIcon,
	CalendarDaysIcon,
	CameraIcon,
	ClipboardCheckIcon,
	Contact2Icon,
	HelpCircleIcon,
	Home,
	LayoutDashboardIcon,
	ListTodoIcon,
	PackageIcon,
	Settings2Icon,
	SettingsIcon,
	UsersIcon,
	Wallet2Icon,
} from "lucide-react";

export interface NavItemWithPermissions {
	title: string;
	url: string;
	icon: LucideIcon;
	permissions?: {
		[key: string]: string[];
	};
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
			items: [{ title: "Home", url: "/home", icon: Home }],
		},
		{
			label: "Workspace",
			items: [
				{
					title: "Dashboard",
					url: "/dashboard",
					icon: LayoutDashboardIcon,
					permissions: { dashboard: ["read"] },
				},
				{
					title: "Review",
					url: "/reviews",
					icon: ClipboardCheckIcon,
					permissions: { review: ["list"] },
				},
			],
		},
		{
			label: "Platform",
			items: [
				{
					title: "Bookings",
					url: "/bookings",
					icon: CalendarDaysIcon,
					permissions: { booking: ["list"] },
				},
				{
					title: "Shoots",
					url: "/shoots",
					icon: CameraIcon,
					permissions: { shoot: ["list"] },
				},
				{
					title: "Deliverables",
					url: "/deliverables",
					icon: PackageIcon,
					permissions: { deliverable: ["list"] },
				},
				{
					title: "Tasks",
					url: "/tasks",
					icon: ListTodoIcon,
					permissions: { task: ["list"] },
				},
				{
					title: "Expenses",
					url: "/expenses",
					icon: BanknoteIcon,
					permissions: { expense: ["list"] },
				},
				{
					title: "Payments",
					url: "/payments",
					icon: Wallet2Icon,
					permissions: { payment: ["list"] },
				},
				{
					title: "Clients",
					url: "/clients",
					icon: Contact2Icon,
					permissions: { client: ["list"] },
				},
				{
					title: "Crews",
					url: "/crews",
					icon: UsersIcon,
					permissions: { crew: ["list"] },
				},
			],
		},

		{
			label: "System",
			items: [
				{
					title: "Configurations",
					url: "/configurations",
					icon: Settings2Icon,
					permissions: { configuration: ["list"] },
				},
				{
					title: "Settings",
					url: "/settings",
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
