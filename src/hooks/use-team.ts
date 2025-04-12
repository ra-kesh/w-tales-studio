import { useQuery } from "@tanstack/react-query";

const mockTeamMembers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@studio.com",
    role: "Lead Photographer",
    specialization: "Wedding Photography",
    status: "active",
    assigned_shoots: 3,
    avatar: "/avatars/rahul.jpg",
    equipment: ["Canon R5", "70-200mm f/2.8", "24-70mm f/2.8"],
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@studio.com",
    role: "Second Shooter",
    specialization: "Portrait & Candid",
    status: "active",
    assigned_shoots: 2,
    avatar: "/avatars/priya.jpg",
    equipment: ["Sony A7IV", "85mm f/1.4", "35mm f/1.8"],
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit@studio.com",
    role: "Cinematographer",
    specialization: "Wedding Films",
    status: "active",
    assigned_shoots: 0,
    avatar: "/avatars/amit.jpg",
    equipment: ["RED Komodo", "DJI RS3 Pro", "24-70mm T2.8"],
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha@studio.com",
    role: "Assistant",
    specialization: "Lighting Setup",
    status: "inactive",
    assigned_shoots: 0,
    avatar: "/avatars/neha.jpg",
    equipment: ["Profoto B10", "Light Stands", "Modifiers"],
  },
  {
    id: 5,
    name: "Vikram Reddy",
    email: "vikram@studio.com",
    role: "Editor",
    specialization: "Photo Retouching",
    status: "active",
    assigned_shoots: 4,
    avatar: "/avatars/vikram.jpg",
    equipment: ["Wacom Tablet", "Calibrated Display"],
  },
];

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockTeamMembers;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
