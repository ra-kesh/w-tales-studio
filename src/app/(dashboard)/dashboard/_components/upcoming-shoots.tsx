"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const upcomingShoots = [
	{
		id: 1,
		clientName: "Rahul & Priya",
		eventType: "Wedding",
		date: "2024-02-15",
		time: "08:00 AM",
		location: "The Leela Palace, Bangalore",
		teamSize: 4,
		package: "Premium",
		clientImage: "/avatars/couple-1.jpg",
	},
	{
		id: 2,
		clientName: "Tata Consultancy",
		eventType: "Corporate",
		date: "2024-02-18",
		time: "10:00 AM",
		location: "TCS Campus, Electronic City",
		teamSize: 2,
		package: "Half Day",
		clientImage: "/avatars/corporate-1.jpg",
	},
	{
		id: 3,
		clientName: "Amit & Sneha",
		eventType: "Pre-Wedding",
		date: "2024-02-20",
		time: "04:00 PM",
		location: "Cubbon Park, Bangalore",
		teamSize: 3,
		package: "Standard",
		clientImage: "/avatars/couple-2.jpg",
	},
];

export function UpcomingShoots() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<Card>
				<CardHeader>
					<CardTitle>Upcoming Shoots</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					{upcomingShoots.map((shoot, index) => (
						<motion.div
							key={shoot.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 * index }}
							className="relative flex gap-4"
						>
							{/* Timeline connector */}
							{index !== upcomingShoots.length - 1 && (
								<div className="absolute left-4 top-10 h-full w-px bg-border" />
							)}

							{/* Date bubble */}
							<div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
								{new Date(shoot.date).getDate()}
							</div>

							<div className="flex-1 space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Avatar>
											<AvatarImage src={shoot.clientImage} />
											<AvatarFallback>
												{shoot.clientName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{shoot.clientName}</p>
											<p className="text-sm text-muted-foreground">
												{shoot.eventType}
											</p>
										</div>
									</div>
									<Badge variant="outline">{shoot.package}</Badge>
								</div>

								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex items-center space-x-2 text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span>{shoot.date}</span>
									</div>
									<div className="flex items-center space-x-2 text-muted-foreground">
										<Clock className="h-4 w-4" />
										<span>{shoot.time}</span>
									</div>
									<div className="flex items-center text-muted-foreground col-span-2">
										<MapPin className="h-4 w-4" />
										<span>{shoot.location}</span>
									</div>
									{/* <div className="flex items-center space-x-2 text-muted-foreground">
										<Users className="h-4 w-4" />
										<span>{shoot.teamSize} Team Members</span>
									</div> */}
								</div>
							</div>
						</motion.div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}
