"use client";

import { format, isPast } from "date-fns";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	Edit,
	MapPin,
	Plus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShootsParams } from "@/hooks/use-shoots-params";
import { isUrl } from "@/lib/utils";
import type { shootsWithAssignments } from "@/types/booking";

interface BookingShootsProps {
	shoots: shootsWithAssignments[];
	bookingId?: string | number;
}

// Reusable component for displaying shoots
function ShootsList({
	shoots,
	isFinished = false,
	bookingId,
}: {
	shoots: shootsWithAssignments[];
	isFinished?: boolean;
	bookingId?: string | number;
}) {
	const [expandedShoots, setExpandedShoots] = useState<Record<string, boolean>>(
		{},
	);

	const { setParams } = useShootsParams();

	const toggleExpanded = (shootId: number | string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedShoots((prev) => ({
			...prev,
			[shootId]: !prev[shootId],
		}));
	};

	if (shoots.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				{isFinished ? "No finished shoots yet" : "No upcoming shoots scheduled"}
			</div>
		);
	}

	// Group shoots by date
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
		{} as Record<
			string,
			{ date: string; dateTime: string; shoots: shootsWithAssignments[] }
		>,
	);

	// Sort dates (ascending for upcoming, descending for finished)
	const sortedDates = Object.values(groupedShoots).sort((a, b) =>
		isFinished
			? b.dateTime.localeCompare(a.dateTime)
			: a.dateTime.localeCompare(b.dateTime),
	);

	return (
		<div className="overflow-hidden space-y-6">
			{sortedDates.map((day) => (
				<div key={day.dateTime} className="border rounded-md overflow-hidden">
					<div className="flex items-center gap-2 p-3 bg-muted/50">
						<Calendar className="h-4 w-4 text-gray-500" />
						<h3 className="font-medium text-sm">
							<time dateTime={day.dateTime}>{day.date}</time>
						</h3>
						<Badge
							variant="outline"
							className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
						>
							{day.shoots.length}
						</Badge>
					</div>
					<div className="divide-y">
						{day.shoots.map((shoot) => {
							const locationIsUrl =
								shoot.location && isUrl(shoot.location as string);

							return (
								<div key={shoot.id} className="p-4">
									<div className="flex flex-col gap-2">
										<div className="flex justify-between">
											<div className="flex flex-col items-start">
												<div className="flex items-center gap-2">
													<div className="text-sm font-medium leading-6 text-gray-900">
														{shoot.title || "Untitled Shoot"}
													</div>
													{isFinished && (
														<Badge
															variant="outline"
															className="bg-green-50 text-green-700 border-green-200"
														>
															Completed
														</Badge>
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
											<div className="flex flex-col items-end">
												<div className="flex items-center text-sm text-gray-500">
													<MapPin className="h-4 w-4 mr-1 text-gray-400" />
													{shoot.location ? (
														locationIsUrl ? (
															<Tooltip>
																<TooltipTrigger asChild>
																	<a
																		href={shoot.location as string}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-blue-600 hover:text-blue-800 underline cursor-pointer max-w-[150px] "
																	>
																		<span className="truncate">
																			{shoot.location as string}
																		</span>
																	</a>
																</TooltipTrigger>
																<TooltipContent className="max-w-xs text-balance">
																	<p className="font-semibold">
																		{shoot.location as string}
																	</p>
																</TooltipContent>
															</Tooltip>
														) : (
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="text-xs text-muted-foreground flex items-center cursor-help max-w-[150px] ">
																		<span className="truncate">
																			{shoot.location as string}
																		</span>
																	</div>
																</TooltipTrigger>
																<TooltipContent className="max-w-xs text-balance">
																	<p className="font-semibold">
																		{shoot.location as string}
																	</p>
																</TooltipContent>
															</Tooltip>
														)
													) : (
														<div className="text-xs text-muted-foreground flex items-center">
															<span>No location specified</span>
														</div>
													)}
												</div>
												<div className="flex items-center justify-end text-sm text-gray-500">
													{isFinished ? (
														<CheckCircle className="h-4 w-4 mr-1 text-green-500" />
													) : (
														<Clock className="h-4 w-4 mr-1 text-blue-500" />
													)}
													{shoot.date
														? format(new Date(shoot.date as string), "h:mm a")
														: "No time"}
												</div>
											</div>
										</div>

										<div className="w-full border rounded-md p-1">
											<div
												onClick={(e) => toggleExpanded(shoot.id, e)}
												className="p-2 flex items-center justify-between cursor-pointer"
											>
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4 text-gray-500" />
													<span className="text-sm font-medium">
														{shoot.shootsAssignments?.length
															? `${shoot.shootsAssignments.length} ${
																	shoot.shootsAssignments.length === 1
																		? "Crew"
																		: "Crews"
																}`
															: "No crew assigned"}
													</span>
												</div>
												{shoot.shootsAssignments?.length > 0 &&
													(expandedShoots[shoot.id] ? (
														<ChevronUp className="h-4 w-4 text-gray-500" />
													) : (
														<ChevronDown className="h-4 w-4 text-gray-500" />
													))}
											</div>
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
																	key={`${assignment.crew.id}-${shoot.id}`}
																	className="flex items-center justify-between p-2 hover:bg-accent/50 transition-colors"
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
																		{/* {assignment.isLead && (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      Lead
                                    </Badge>
                                  )} */}
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
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

export function BookingShoots({ shoots = [], bookingId }: BookingShootsProps) {
	const { setParams } = useShootsParams();

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
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Shoots</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						setParams({
							createShoot: true,
						})
					}
				>
					<Plus className="h-4 w-4 mr-2" />
					New Shoot
				</Button>
			</div>

			<Card>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>{completionPercentage}% completed</span>
							<span>
								{finishedShoots.length}/{shoots.length} shoots
							</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary"
								style={{ width: `${completionPercentage}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

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
		</div>
	);
}
