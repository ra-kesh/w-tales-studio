"use client";

import { format } from "date-fns";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Edit,
	FileText,
	Mail,
	Phone,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientParams } from "@/hooks/use-client-params";
import { cn } from "@/lib/utils";
import type { BookingDetail } from "@/types/booking";

interface BookingOverviewProps {
	booking: BookingDetail;
}

export function BookingOverview({ booking }: BookingOverviewProps) {
	const { setParams } = useClientParams();

	const packageCost = Number(booking.packageCost);

	const totalReceived = booking.receivedAmounts.reduce(
		(sum, payment) => sum + Number(payment.amount),
		0,
	);

	const packageAmount = Number(packageCost);

	const paymentPercentage = Math.min(
		Math.round((totalReceived / packageAmount) * 100),
		100,
	);

	const milestones = [
		{
			id: "advance",
			label: "Advance Payment",
			status: totalReceived > 0 ? "completed" : "not-started",
			date: (() => {
				try {
					return booking.receivedAmounts.length > 0 &&
						booking.receivedAmounts[0].paidOn
						? format(new Date(booking.receivedAmounts[0].paidOn), "d MMM, yyyy")
						: null;
				} catch (error) {
					console.error("Error formatting advance payment date:", error);
					return null;
				}
			})(),
		},
		{
			id: "shoots",
			label: "Shoots Completed",
			status: (() => {
				// Check if there are any shoots
				if (!booking.shoots || booking.shoots.length === 0)
					return "not-started";

				// Get current date for comparison
				const currentDate = new Date();

				// Check if all shoots have dates in the past
				const allCompleted = booking.shoots.every(
					(shoot) => shoot.date && new Date(shoot.date) < currentDate,
				);

				// Check if some shoots have dates in the past
				const someCompleted = booking.shoots.some(
					(shoot) => shoot.date && new Date(shoot.date) < currentDate,
				);

				if (allCompleted) return "completed";
				if (someCompleted) return "in-progress";
				return "not-started";
			})(),
			date: null,
		},
		{
			id: "deliverables",
			label: "Deliverables Completed",
			status: booking.deliverables?.every(
				(deliverable) => deliverable.status === "completed",
			)
				? "completed"
				: booking.deliverables?.some(
							(deliverable) => deliverable.status === "completed",
						)
					? "in-progress"
					: "not-started",
			date: null,
		},
		{
			id: "payment",
			label: "Full Payment Received",
			status: paymentPercentage === 100 ? "completed" : "not-started",
			date: (() => {
				try {
					return paymentPercentage === 100 &&
						booking.receivedAmounts.length > 0 &&
						booking.receivedAmounts[booking.receivedAmounts.length - 1].paidOn
						? format(
								new Date(
									booking.receivedAmounts[booking.receivedAmounts.length - 1]
										.paidOn as string,
								),
								"d MMM, yyyy",
							)
						: null;
				} catch (error) {
					console.error("Error formatting final payment date:", error);
					return null;
				}
			})(),
		},
	];

	// Calculate overall project completion
	const completedMilestones = milestones.filter(
		(m) => m.status === "completed",
	).length;
	const overallCompletion = Math.round(
		(completedMilestones / milestones.length) * 100,
	);
	const getInitials = (name: string | null | undefined) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	};

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg border shadow-sm">
				<div className="p-5">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold">Overview</h2>
						<span className="text-sm font-medium text-orange-500">
							{overallCompletion}% Completed
						</span>
					</div>

					<div className="h-2 mb-6 bg-gray-200 rounded-full overflow-hidden">
						<div
							className={cn(
								"h-full transition-all",
								overallCompletion < 30
									? "bg-red-500"
									: overallCompletion < 70
										? "bg-orange-500"
										: "bg-green-500",
							)}
							style={{ width: `${overallCompletion}%` }}
						/>
					</div>

					<div className="space-y-4">
						{milestones.map((milestone) => (
							<div
								key={milestone.id}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									{milestone.status === "completed" ? (
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									) : milestone.status === "in-progress" ? (
										<Clock className="h-5 w-5 text-orange-500" />
									) : (
										<AlertCircle className="h-5 w-5 text-gray-300" />
									)}
									<span className="text-sm font-medium">{milestone.label}</span>
								</div>
								<div className="text-sm">
									{milestone.status === "completed" ? (
										<span className="text-green-600">
											Completed {milestone.date && `(${milestone.date})`}
										</span>
									) : milestone.status === "in-progress" ? (
										<span className="text-orange-500">In Progress</span>
									) : (
										<span className="text-gray-400">Not Started</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-muted-foreground" />
						<span>Clients</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{booking.participants && booking.participants.length > 0 ? (
						<div className="divide-y">
							{booking.participants.map((participant) => (
								<div
									key={participant.client.id}
									className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
								>
									<div className="flex items-center gap-4">
										<Avatar className="h-10 w-10">
											<AvatarFallback className="bg-primary/10 text-primary font-medium">
												{getInitials(participant.client.name)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium">
												{participant.client.name}
											</div>
											<div className="text-sm text-muted-foreground capitalize">
												{participant.role}
											</div>
										</div>
										<div className="mb-auto">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 rounded-full hover:bg-gray-100 ml-2"
												onClick={() =>
													setParams({
														clientId: participant.client.id.toString(),
													})
												}
											>
												<Edit className="h-3.5 w-3.5 text-gray-500" />
												<span className="sr-only">Edit Client</span>
											</Button>
										</div>
									</div>
									<div className="text-right text-sm text-muted-foreground space-y-1">
										{participant.client.email && (
											<div className="flex items-center justify-end gap-2">
												<span>{participant.client.email}</span>
												<Mail className="h-4 w-4" />
											</div>
										)}
										{participant.client.phoneNumber && (
											<div className="flex items-center justify-end gap-2">
												<span>{participant.client.phoneNumber}</span>
												<Phone className="h-4 w-4" />
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
							<Users className="h-8 w-8 mb-2 opacity-50" />
							<p>No participants have been added to this booking yet.</p>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="bg-white rounded-lg border shadow-sm">
				<div className="p-5">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-base font-semibold">Notes</h3>
					</div>

					{booking.note ? (
						<div className="prose prose-sm max-w-none">
							<p>{booking.note}</p>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
							<FileText className="h-8 w-8 mb-2 opacity-50" />
							<p>No notes have been added to this booking yet.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
