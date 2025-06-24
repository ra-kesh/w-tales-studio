"use client";

import { useState, useRef, useEffect } from "react";
import { CheckSquare, Camera, Image, Edit, Info, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookingOverview } from "./booking-overview";
import { BookingShoots } from "./booking-shoots";
import { BookingDeliverables } from "./booking-deliverables";
import { BookingTasks } from "./booking-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingDetail } from "@/hooks/use-bookings";
import {
	CustomTabsContent,
	CustomTabsList,
	CustomTabsTrigger,
	Tabs,
} from "@/components/ui/tabs";
import Link from "next/link";

export function BookingDetails({ id }: { id: string }) {
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);
	const router = useRouter();

	const { data: booking, isLoading } = useBookingDetail(id);

	// This effect is crucial for the layout to work.
	useEffect(() => {
		if (headerRef.current) {
			setHeaderHeight(headerRef.current.offsetHeight);
		}
	}, [booking]);

	const tabs = [
		{ id: "overview", label: "Overview", icon: Info },
		{ id: "shoots", label: "Shoots", icon: Camera },
		{ id: "deliverables", label: "Deliverables", icon: Image },
		{ id: "tasks", label: "Tasks", icon: CheckSquare },
	];

	const handleClose = () => router.push("/bookings");
	const handleEdit = () => router.push(`/bookings/edit/${id}`);

	if (isLoading || !booking) {
		return (
			<div className="flex h-full flex-1 items-center justify-center">
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<Tabs
			defaultValue="overview"
			className="h-full flex-1 flex flex-col border-r gap-0"
		>
			<div ref={headerRef} className="flex-shrink-0 border-b bg-white z-10">
				<div className="px-6 space-y-6 pt-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<h2 className="text-2xl font-bold tracking-tight">
								{booking.name}
							</h2>
							<Badge variant={"secondary"}>{booking.status}</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={"link"}
								type="button"
								className="font-semibold cursor-pointer"
								onClick={router.back}
							>
								Back
							</Button>

							<Link
								href={{
									pathname: `/bookings/edit/${id}`,
									query: { tab: "details" },
								}}
								prefetch={true}
							>
								<Button
									size="sm"
									className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
								>
									Edit Booking
								</Button>
							</Link>
						</div>
					</div>

					{/* Client Details Grid */}
					<div className="rounded-lg bg-muted/40 w-full">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 p-4">
							{/* <div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Bride Name
								</p>
								<p className="text-sm font-medium">
									{booking.clients.brideName || "Not specified"}
								</p>
							</div> */}
							{/* <div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Groom Name
								</p>
								<p className="text-sm font-medium">
									{booking.clients.groomName || "Not specified"}
								</p>
							</div> */}
							{/* <div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Email address
								</p>
								<p className="text-sm font-medium">
									{booking.clients.email || "Not provided"}
								</p>
							</div> */}
							<div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Package Type
								</p>
								<p className="text-sm font-medium">
									{booking.packageTypeValue}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Package Cost
								</p>
								<p className="text-sm font-medium">
									₹{Number(booking.packageCost).toLocaleString()}
								</p>
							</div>
							{/* <div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									Phone number
								</p>
								<p className="text-sm font-medium">
									{booking.clients.phoneNumber || "Not provided"}
								</p>
							</div> */}
						</div>
					</div>
				</div>

				<div className="px-6">
					<CustomTabsList>
						{tabs.map((tab) => (
							<CustomTabsTrigger key={tab.id} value={tab.id}>
								<tab.icon className="h-4 w-4 mr-2" />
								{tab.label}
							</CustomTabsTrigger>
						))}
					</CustomTabsList>
				</div>
			</div>

			<ScrollArea
				className="flex-1"
				style={{ height: `calc(100% - ${headerHeight}px)` }}
			>
				<div className="px-6 pb-8 ">
					<CustomTabsContent value="overview">
						<BookingOverview booking={booking} />
					</CustomTabsContent>
					<CustomTabsContent value="shoots">
						<BookingShoots shoots={booking.shoots} />
					</CustomTabsContent>
					<CustomTabsContent value="deliverables">
						<BookingDeliverables deliverables={booking.deliverables} />
					</CustomTabsContent>
					<CustomTabsContent value="tasks">
						<BookingTasks tasks={booking.tasks} />
					</CustomTabsContent>
				</div>
			</ScrollArea>
		</Tabs>
	);
}
