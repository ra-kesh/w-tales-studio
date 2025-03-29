import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	PieChart,
	Settings2,
	SquareTerminal,
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
		{
			name: "Maxxer Media",
			logo: AudioWaveform,
			plan: "Startup",
		},
	],
	navMain: [
		{
			title: "Bookings",
			url: "/bookings",
			icon: SquareTerminal,
			isActive: true,
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
	],
	// projects: [
	//   {
	//     name: "Celebrity Wedding",
	//     url: "#",
	//     // icon: Frame,
	//   },
	//   {
	//     name: "SPortsman Wedding",
	//     url: "#",
	//     // icon: PieChart,
	//   },
	// ],
};
