"use client";

import { useState, useRef, useEffect } from "react";
import {
	Calendar,
	DollarSign,
	Package,
	CheckSquare,
	Camera,
	Image,
	X,
	Edit,
	Info,
	ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { BookingDetail } from "@/lib/db/schema";
import { BookingOverview } from "./booking-overview";
import { BookingShoots } from "./booking-shoots";
import { BookingDeliverables } from "./booking-deliverables";
import { BookingFinancials } from "./booking-financials";
import { BookingTasks } from "./booking-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BookingDetails({ booking }: { booking: BookingDetail }) {
	const [activeTab, setActiveTab] = useState("overview");
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (headerRef.current) {
			setHeaderHeight(headerRef.current.offsetHeight);
		}
	}, []);

	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: <Info className="h-4 w-4 mr-2" />,
		},
		{
			id: "shoots",
			label: "Shoots",
			icon: <Camera className="h-4 w-4 mr-2" />,
		},
		{
			id: "deliverables",
			label: "Deliverables",
			icon: <Image className="h-4 w-4 mr-2" />,
		},

		{
			id: "tasks",
			label: "Tasks",
			icon: <CheckSquare className="h-4 w-4 mr-2" />,
		},
		{
			id: "financials",
			label: "Financials",
			icon: <DollarSign className="h-4 w-4 mr-2" />,
		},
	];

	const handleClose = () => {
		router.push("/bookings");
	};

	const handleEdit = () => {
		router.push(`/bookings/edit/${booking.id}`);
	};

	return (
		<div className="h-full flex-1 flex flex-col border-r">
			{/* Fixed Header */}
			<div ref={headerRef} className="border-b bg-white z-10">
				<div className="p-6 pb-4">
					{/* Action buttons and status */}
					<div className="flex items-center justify-between mb-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClose}
							className="text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Bookings
						</Button>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={handleEdit}>
								<Edit className="h-4 w-4 mr-2" />
								Edit Booking
							</Button>
						</div>
					</div>

					{/* Booking Title and Details */}
					<div className="flex items-start justify-between">
						<div className="flex gap-4">
							<h2 className="text-2xl font-bold tracking-tight">
								{booking.name}
							</h2>
							<div>
								<Badge variant={"secondary"}>{booking.status}</Badge>
							</div>
						</div>
						{/* <div className="text-sm text-muted-foreground">
							ID: {booking.id}
						</div> */}
					</div>
				</div>

				{/* Custom Tab Navigation */}
				<div className="flex  px-6">
					{tabs.map((tab) => (
						<button
							type="button"
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center px-4 py-3 text-sm font-medium transition-colors relative",
								"hover:text-primary focus-visible:outline-none",
								activeTab === tab.id ? "text-primary" : "text-muted-foreground",
							)}
						>
							{tab.icon}
							{tab.label}
							{activeTab === tab.id && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* Scrollable Tab Content */}
			<ScrollArea
				className="flex-1"
				style={{ height: `calc(100% - ${headerHeight}px)` }}
			>
				<div className="p-6">
					{activeTab === "overview" && <BookingOverview booking={booking} />}
					{activeTab === "shoots" && <BookingShoots shoots={booking.shoots} />}
					{activeTab === "deliverables" && (
						<BookingDeliverables deliverables={booking.deliverables} />
					)}

					{activeTab === "tasks" && <BookingTasks tasks={booking.tasks} />}

					{activeTab === "financials" && (
						<BookingFinancials
							packageCost={booking.packageCost}
							receivedAmounts={booking.receivedAmounts}
							paymentSchedules={booking.paymentSchedules}
							expenses={booking.expenses}
						/>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
