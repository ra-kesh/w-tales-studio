"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	IndianRupee,
	Package,
	CalendarCheck,
	ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const recentBookings = [
	{
		id: 1,
		clientName: "Vikram & Meera",
		eventType: "Wedding",
		date: "2024-06-15",
		package: "Premium",
		amount: 250000,
		status: "confirmed",
		paymentStatus: "partial",
		clientImage: "/avatars/couple-3.jpg",
		advanceAmount: 100000,
	},
	{
		id: 2,
		clientName: "Microsoft India",
		eventType: "Corporate Event",
		date: "2024-05-20",
		package: "Full Day",
		amount: 85000,
		status: "pending",
		paymentStatus: "pending",
		clientImage: "/avatars/corporate-2.jpg",
		advanceAmount: 0,
	},
	{
		id: 3,
		clientName: "Arjun & Diya",
		eventType: "Pre-Wedding",
		date: "2024-05-10",
		package: "Standard",
		amount: 125000,
		status: "confirmed",
		paymentStatus: "paid",
		clientImage: "/avatars/couple-4.jpg",
		advanceAmount: 125000,
	},
];

const statusColors = {
	confirmed: "default",
	pending: "warning",
	paid: "default",
	partial: "warning",
} as const;

export function RecentBookings() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5 }}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Recent Bookings</CardTitle>
					<Button variant="ghost" size="sm" className="text-muted-foreground">
						View All
						<ArrowUpRight className="ml-2 h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent className="space-y-6">
					{recentBookings.map((booking, index) => (
						<motion.div
							key={booking.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 * index }}
							className="flex items-center space-x-4"
						>
							<Avatar className="h-12 w-12">
								<AvatarImage src={booking.clientImage} />
								<AvatarFallback>
									{booking.clientName
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>

							<div className="flex-1 space-y-3">
								<div className="flex items-center justify-between">
									<p className="font-medium">{booking.clientName}</p>
									<Badge
										variant={
											statusColors[
												booking.status as keyof typeof statusColors
											] as "default" | "destructive" | "outline" | "secondary"
										}
									>
										{booking.status}
									</Badge>
								</div>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center space-x-4">
										<div className="flex items-center text-muted-foreground">
											<Package className="mr-1 h-4 w-4" />
											{booking.package}
										</div>
										<div className="flex items-center text-muted-foreground">
											<CalendarCheck className="mr-1 h-4 w-4" />
											{booking.date}
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-1 text-sm text-muted-foreground">
										<IndianRupee className="h-4 w-4" />
										<span>{booking.amount.toLocaleString()}</span>
									</div>
									{/* <Badge
										variant={
											statusColors[
												booking.paymentStatus as keyof typeof statusColors
											] as "default" | "outline" | "secondary" | "destructive"
										}
									>
										{booking.paymentStatus === "partial"
											? `₹${booking.advanceAmount.toLocaleString()} paid`
											: booking.paymentStatus}
									</Badge> */}
								</div>
							</div>
						</motion.div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}
