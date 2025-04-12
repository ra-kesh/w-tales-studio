"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
	Clock,
	Image as ImageIcon,
	Upload,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import React from "react";

const deliverables = [
	{
		id: 1,
		clientName: "Karthik & Ananya",
		eventType: "Wedding",
		shootDate: "2024-01-15",
		deadline: "2024-02-15",
		progress: 75,
		totalPhotos: 1200,
		edited: 900,
		status: "in-progress",
		priority: "high",
		clientImage: "/avatars/couple-5.jpg",
		tasks: [
			{ name: "Raw Selection", completed: true },
			{ name: "Color Correction", completed: true },
			{ name: "Retouching", completed: false },
			{ name: "Album Design", completed: false },
		],
	},
	{
		id: 2,
		clientName: "Infosys Limited",
		eventType: "Corporate",
		shootDate: "2024-01-20",
		deadline: "2024-02-10",
		progress: 90,
		totalPhotos: 400,
		edited: 360,
		status: "review",
		priority: "medium",
		clientImage: "/avatars/corporate-3.jpg",
		tasks: [
			{ name: "Raw Selection", completed: true },
			{ name: "Color Correction", completed: true },
			{ name: "Retouching", completed: true },
			{ name: "Final Export", completed: false },
		],
	},
	{
		id: 3,
		clientName: "Rohan & Ishita",
		eventType: "Pre-Wedding",
		shootDate: "2024-01-25",
		deadline: "2024-02-20",
		progress: 40,
		totalPhotos: 300,
		edited: 120,
		status: "in-progress",
		priority: "normal",
		clientImage: "/avatars/couple-6.jpg",
		tasks: [
			{ name: "Raw Selection", completed: true },
			{ name: "Color Correction", completed: false },
			{ name: "Retouching", completed: false },
			{ name: "Final Export", completed: false },
		],
	},
];

const priorityColors = {
	high: "destructive",
	medium: "warning",
	normal: "default",
} as const;

const statusIcons = {
	"in-progress": Upload,
	review: CheckCircle2,
	delayed: AlertCircle,
};

export function PendingDeliverables() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 }}
		>
			<Card>
				<CardHeader>
					<CardTitle>Pending Deliverables</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{deliverables.map((deliverable, index) => (
						<motion.div
							key={deliverable.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 * index }}
							className="space-y-4"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<Avatar>
										<AvatarImage src={deliverable.clientImage} />
										<AvatarFallback>
											{deliverable.clientName
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="flex items-center space-x-2">
											<p className="font-medium">{deliverable.clientName}</p>
											<Badge
												variant={
													priorityColors[
														deliverable.priority as keyof typeof priorityColors
													] as
														| "destructive"
														| "default"
														| "outline"
														| "secondary"
												}
											>
												{deliverable.priority}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{deliverable.eventType}
										</p>
									</div>
								</div>
								{/* {statusIcons[
									deliverable.status as keyof typeof statusIcons
								] && (
									<div className="flex items-center text-muted-foreground">
										{React.createElement(
											statusIcons[
												deliverable.status as keyof typeof statusIcons
											],
											{ className: "h-4 w-4 mr-1" },
										)}
										<span className="text-sm capitalize">
											{deliverable.status}
										</span>
									</div>
								)} */}
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center space-x-2">
										<ImageIcon className="h-4 w-4 text-muted-foreground" />
										<span>
											{deliverable.edited}/{deliverable.totalPhotos} Photos
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span>Due {deliverable.deadline}</span>
									</div>
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Progress</span>
										<span>{deliverable.progress}%</span>
									</div>
									<Progress value={deliverable.progress} />
								</div>
							</div>

							{/* <div className="flex flex-wrap gap-2">
								{deliverable.tasks.map((task, taskIndex) => (
									<Badge
										key={taskIndex}
										variant={task.completed ? "default" : "outline"}
										className="text-xs"
									>
										{task.name}
									</Badge>
								))}
							</div> */}

							{index !== deliverables.length - 1 && (
								<div className="border-t" />
							)}
						</motion.div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}
