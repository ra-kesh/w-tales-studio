import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
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
      title: "Projects",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Shoots",
          url: "#",
        },
        {
          title: "Deliverables",
          url: "#",
        },
        {
          title: "Tasks",
          url: "#",
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
