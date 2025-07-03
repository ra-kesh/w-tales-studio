import {
	AudioWaveform,
	BookOpen,
	Bot,
	CameraIcon,
	Command,
	FolderIcon,
	Frame,
	GalleryVerticalEnd,
	HelpCircleIcon,
	Home,
	LayoutDashboardIcon,
	PieChart,
	SearchIcon,
	Settings2,
	Settings2Icon,
	SettingsIcon,
	SquareTerminal,
	UsersIcon,
	Wallet2Icon,
	WalletIcon,
} from "lucide-react";

export const sidebarData = {
	user: {
		name: "satish",
		email: "s@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "WeddingTales",
			logo: GalleryVerticalEnd,
			plan: "Studio",
		},
		// {
		// 	name: "Maxxer Media",
		// 	logo: AudioWaveform,
		// 	plan: "Startup",
		// },
	],
	navMain: [
		{
			title: "Home",
			url: "/home",
			icon: Home,
			// isActive: true,
		},
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboardIcon,
			// isActive: true,
		},
		{
			title: "Bookings",
			url: "/bookings",
			icon: CameraIcon,
			// isActive: true,
			items: [
				{
					title: "Shoots",
					url: "/shoots",
				},
				{
					title: "Deliverables",
					url: "/deliverables",
				},
				{
					title: "Tasks",
					url: "/tasks",
				},
				{
					title: "Expenses",
					url: "/expenses",
				},
				{
					title: "Clients",
					url: "/clients",
				},
			],
		},

		{
			title: "Payments",
			url: "/payments",
			icon: Wallet2Icon,
			// isActive: true,
		},
		{
			title: "Crews",
			url: "/crews",
			icon: UsersIcon,
			// isActive: true,
		},
		{
			title: "Configurations",
			url: "/configurations",
			icon: Settings2Icon,
			// isActive: true,
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "/settings",
			icon: SettingsIcon,
		},
		{
			title: "Get Help",
			url: "#",
			icon: HelpCircleIcon,
		},
		// {
		// 	title: "Search",
		// 	url: "#",
		// 	icon: SearchIcon,
		// },
	],
	// bookings: [
	// 	{
	// 		name: "Celebrity Wedding",
	// 		url: "#",
	// 		// icon: Frame,
	// 	},
	// 	{
	// 		name: "SPortsman Wedding",
	// 		url: "#",
	// 		// icon: PieChart,
	// 	},
	// ],
};
