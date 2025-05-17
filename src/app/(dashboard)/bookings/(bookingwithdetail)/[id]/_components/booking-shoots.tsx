"use client";

import * as React from "react";
import { Fragment, useState } from "react";
import type { Shoot } from "@/lib/db/schema";
import { format, isPast } from "date-fns";
import {
	Calendar,
	CheckCircle,
	Clock,
	ChevronDown,
	ChevronUp,
	MapPin,
	Users,
	Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OpenShootsSheet } from "@/app/(dashboard)/shoots/_components/open-shoots-sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useShootsParams } from "@/hooks/use-shoots-params";

interface BookingShootsProps {
	shoots: Shoot[];
	bookingId?: string | number;
}

// Reusable component for displaying shoots
function ShootsList({
	shoots,
	isFinished = false,
	bookingId,
}: {
	shoots: Shoot[];
	isFinished?: boolean;
	bookingId?: string | number;
}) {
	const [expandedShoots, setExpandedShoots] = useState<Record<string, boolean>>(
		{},
	);

	const toggleExpanded = (shootId: number | string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedShoots((prev) => ({
			...prev,
			[shootId]: !prev[shootId],
		}));
	};

	const groupedShoots = shoots.reduce(
		(acc, shoot) => {
			const shootDate = shoot.date ? new Date(shoot.date as string) : null;
			const dateKey = shootDate ? format(shootDate, "yyyy-MM-dd") : "No Date";
			const displayDate = shootDate
				? format(shootDate, "MMMM d, yyyy")
				: "No Date";

			if (!acc[dateKey]) {
				acc[dateKey] = {
					date: displayDate,
					dateTime: dateKey,
					shoots: [],
				};
			}

			acc[dateKey].shoots.push(shoot);
			return acc;
		},
		{} as Record<string, { date: string; dateTime: string; shoots: Shoot[] }>,
	);

	// Sort dates (ascending for upcoming, descending for finished)
	const sortedDates = Object.values(groupedShoots).sort((a, b) =>
		isFinished
			? b.dateTime.localeCompare(a.dateTime)
			: a.dateTime.localeCompare(b.dateTime),
	);

	const { setParams } = useShootsParams();

	if (shoots.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				{isFinished ? "No finished shoots yet" : "No upcoming shoots scheduled"}
			</div>
		);
	}

	return (
		<div className="overflow-hidden">
			<table className="w-full text-left">
				<thead className="sr-only">
					<tr>
						<th>Name</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody>
					{sortedDates.map((day) => (
						<Fragment key={day.dateTime}>
							<tr className="text-sm leading-6 text-gray-900">
								<th
									scope="colgroup"
									colSpan={2}
									className="relative isolate py-2 px-4 font-semibold"
								>
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-2 text-gray-500" />
										<time dateTime={day.dateTime}>{day.date}</time>
									</div>
									<div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
									<div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
								</th>
							</tr>
							{day.shoots.map((shoot) => (
								<React.Fragment key={shoot.id}>
									<tr>
										<td className="relative py-5 px-4 w-full">
											<div className="flex flex-col gap-2">
												<div className="flex justify-between">
													<div className="flex flex-col items-start">
														<div className="flex items-center gap-2">
															<div className="text-sm font-medium leading-6 text-gray-900">
																{shoot.title || "Untitled Shoot"}
															</div>
															{isFinished && (
																<div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
																	Completed
																</div>
															)}

															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6 rounded-full hover:bg-gray-100 ml-2"
																onClick={() =>
																	setParams({
																		shootId: shoot.id.toString(),
																	})
																}
															>
																<Edit className="h-3.5 w-3.5 text-gray-500" />
																<span className="sr-only">Edit shoot</span>
															</Button>
														</div>
														{shoot.notes ? (
															<div className="text-xs leading-6 text-gray-600">
																{shoot.notes}
															</div>
														) : null}
													</div>
													<div className="flex flex-col">
														<div className="flex items-center text-sm text-gray-500">
															<MapPin className="h-4 w-4 mr-1 text-gray-400" />
															{(shoot.location as string) || "No location"}
														</div>
														<div className="flex items-center justify-end text-sm text-gray-500">
															{isFinished ? (
																<CheckCircle className="h-4 w-4 mr-1 text-green-500" />
															) : (
																<Clock className="h-4 w-4 mr-1 text-blue-500" />
															)}
															{shoot.date
																? format(
																		new Date(shoot.date as string),
																		"h:mm a",
																	)
																: "No time"}
														</div>
													</div>
												</div>

												<div className="w-full border rounded-md p-1">
													{shoot.shootsAssignments &&
													shoot.shootsAssignments.length > 0 ? (
														<div
															onClick={(e) => toggleExpanded(shoot.id, e)}
															className="p-2 flex items-center justify-between"
														>
															<div className="flex items-center gap-2">
																<Users className="h-4 w-4 text-gray-500" />
																<span className="text-sm font-medium">
																	{shoot.shootsAssignments.length}{" "}
																	{shoot.shootsAssignments.length === 1
																		? "Crew"
																		: "Crews"}
																</span>
															</div>
															{expandedShoots[shoot.id] ? (
																<ChevronUp className="h-4 w-4 text-gray-500" />
															) : (
																<ChevronDown className="h-4 w-4 text-gray-500" />
															)}
														</div>
													) : (
														<div className="text-sm text-muted-foreground flex items-center">
															<Users className="h-4 w-4 mr-1 text-gray-400" />
															No crew assigned
														</div>
													)}
													{expandedShoots[shoot.id] &&
														shoot.shootsAssignments &&
														shoot.shootsAssignments.length > 0 && (
															<div className="bg-gray-50 rounded-md m-2">
																{shoot.shootsAssignments.map((assignment) => {
																	const name =
																		assignment.crew.member?.user?.name ||
																		assignment.crew.name;
																	const initials = name
																		?.split(" ")
																		.map((n: string) => n[0])
																		.join("");

																	return (
																		<div
																			key={assignment.id}
																			className="flex items-center justify-between p-2 "
																		>
																			<div className="flex items-center gap-3">
																				<Avatar className="h-10 w-10">
																					<AvatarFallback className="bg-primary/10 text-primary">
																						{initials}
																					</AvatarFallback>
																				</Avatar>
																				<div>
																					<div className="font-medium">
																						{name || "Unnamed"}
																					</div>
																					<div className="text-sm text-gray-500">
																						{assignment.crew?.role || "No role"}
																					</div>
																				</div>
																			</div>
																			<div className="flex items-center">
																				{assignment.isLead && (
																					<Badge
																						variant="outline"
																						className="bg-blue-50 text-blue-700 border-blue-200"
																					>
																						Lead
																					</Badge>
																				)}
																				{assignment.crew?.specialization && (
																					<div className="ml-2 text-sm text-gray-500">
																						{assignment.crew.specialization}
																					</div>
																				)}
																			</div>
																		</div>
																	);
																})}
															</div>
														)}
												</div>
												{/* Expanded crew details */}
											</div>
											<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
											<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
										</td>
									</tr>
								</React.Fragment>
							))}
						</Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function BookingShoots({ shoots, bookingId }: BookingShootsProps) {
	// Separate shoots into upcoming and finished based on date
	const upcomingShoots = shoots.filter(
		(shoot) => !isPast(new Date(shoot.date as string)),
	);

	const finishedShoots = shoots.filter((shoot) =>
		isPast(new Date(shoot.date as string)),
	);

	// Calculate completion percentage
	const completionPercentage =
		shoots.length > 0
			? Math.round((finishedShoots.length / shoots.length) * 100)
			: 0;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-xl font-bold">Shoots</CardTitle>

				<OpenShootsSheet bookingId={bookingId} />
			</CardHeader>

			<CardContent>
				<Tabs defaultValue="upcoming" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="upcoming">
							Upcoming ({upcomingShoots.length})
						</TabsTrigger>
						<TabsTrigger value="finished">
							Finished ({finishedShoots.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="upcoming">
						<ShootsList
							shoots={upcomingShoots}
							isFinished={false}
							bookingId={bookingId}
						/>
					</TabsContent>

					<TabsContent value="finished">
						<ShootsList
							shoots={finishedShoots}
							isFinished={true}
							bookingId={bookingId}
						/>
					</TabsContent>
				</Tabs>
				<div className="flex w-full items-center gap-2 py-4">
					<Progress value={completionPercentage} className="h-2" />
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{completionPercentage}% Complete
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
