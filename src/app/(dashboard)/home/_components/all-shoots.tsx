"use client";

import { isFuture, isPast, isToday, startOfDay } from "date-fns";
import { Archive, Calendar, Camera, CheckCircle, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllShootAssignments } from "@/hooks/use-all-shoots-assignment";
import { ShootCard } from "./shoots-card";

const filterOptions = [
	{
		id: "all",
		label: "All Shoots",
		icon: Camera,
		description: "View all your assigned shoots",
	},
	{
		id: "in-progress",
		label: "In Progress",
		icon: CheckCircle,
		description: "Current ongoing shoots",
	},
	{
		id: "today",
		label: "Today's Shoots",
		icon: Clock,
		description: "Shoots happening today",
	},
	{
		id: "upcoming",
		label: "Upcoming Shoots",
		icon: Calendar,
		description: "Shoots scheduled for future dates",
	},

	{
		id: "past",
		label: "Past Shoots",
		icon: Archive,
		description: "Completed shoots",
	},
];

export function AllShoots() {
	const [selectedFilter, setSelectedFilter] = useState("all");
	const { data, isLoading, isError, hasNextPage, fetchNextPage } =
		useAllShootAssignments();

	const filteredShoots = useMemo(() => {
		if (!data) return [];

		const allShoots = data.pages.flatMap((page) => page.data);
		const today = startOfDay(new Date());

		switch (selectedFilter) {
			case "upcoming":
				return allShoots.filter((assignment) => {
					const shootDate = startOfDay(new Date(assignment.shoot.date));
					return isFuture(shootDate);
				});

			case "today":
				return allShoots.filter((assignment) => {
					const shootDate = new Date(assignment.shoot.date);
					return isToday(shootDate);
				});

			case "in-progress":
				// Assuming shoots happening today or recently started are "in progress"
				return allShoots.filter((assignment) => {
					const shootDate = new Date(assignment.shoot.date);
					return (
						isToday(shootDate) ||
						(isPast(shootDate) &&
							new Date().getTime() - shootDate.getTime() < 24 * 60 * 60 * 1000)
					); // Within last 24 hours
				});

			case "past":
				return allShoots.filter((assignment) => {
					const shootDate = startOfDay(new Date(assignment.shoot.date));
					return isPast(shootDate) && !isToday(shootDate);
				});

			default:
				return allShoots;
		}
	}, [data, selectedFilter]);

	if (isLoading) {
		return <div>Loading shoots...</div>;
	}

	if (isError || !data) {
		return <div>Could not load shoots. Please try again later.</div>;
	}

	const selectedOption = filterOptions.find(
		(option) => option.id === selectedFilter,
	);

	return (
		<div className="grid grid-cols-12 gap-12">
			{/* Sidebar Menu */}
			<div className="col-span-12 lg:col-span-4 2xl:col-span-3 flex-shrink-0">
				<Card className="border border-gray-200 py-0">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">Filter Shoots</h3>
							<p className="text-sm text-gray-500 mt-1">
								Organize your shoots by status and date
							</p>
						</div>

						<nav className="p-2">
							{filterOptions.map((option) => {
								const Icon = option.icon;
								const isSelected = selectedFilter === option.id;

								return (
									<button
										key={option.id}
										onClick={() => setSelectedFilter(option.id)}
										className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors
                      ${
												isSelected
													? "bg-blue-50 text-indigo-600 border border-blue-200"
													: "text-gray-700 hover:bg-gray-50"
											}
                    `}
									>
										<Icon
											className={`h-4 w-4 ${isSelected ? "text-indigo-600" : "text-gray-400"}`}
										/>
										<div className="flex-1 min-w-0">
											<p
												className={`text-sm font-medium ${isSelected ? "text-indigo-600" : "text-gray-900"}`}
											>
												{option.label}
											</p>
											<p className="text-xs text-gray-500 truncate">
												{option.description}
											</p>
										</div>
									</button>
								);
							})}
						</nav>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="flex-1 col-span-12 lg:col-span-8 2xl:col-span-9 space-y-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{selectedOption?.label}
					</h2>
					<p className="text-sm text-gray-600">
						{selectedOption?.description} • {filteredShoots.length} shoot
						{filteredShoots.length !== 1 ? "s" : ""}
					</p>
				</div>

				<ScrollArea className="h-[70vh] pr-4">
					<div className="space-y-4">
						{filteredShoots.length > 0 ? (
							<>
								<ul role="list" className="divide-y divide-gray-100">
									{filteredShoots.map((assignment) => (
										<ShootCard key={assignment.id} assignment={assignment} />
									))}
								</ul>
								{hasNextPage && selectedFilter === "all" && (
									<div className="flex justify-center mt-4">
										<Button
											variant="outline"
											onClick={() => fetchNextPage()}
											disabled={isLoading}
										>
											Load More
										</Button>
									</div>
								)}
							</>
						) : (
							<EmptyState
								icon={selectedOption?.icon || Camera}
								title={`No ${selectedOption?.label || "Shoots"} Found`}
								description={getEmptyStateDescription(selectedFilter)}
							/>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}

function getEmptyStateDescription(filter: string): string {
	switch (filter) {
		case "upcoming":
			return "You don't have any upcoming shoots scheduled.";
		case "today":
			return "No shoots scheduled for today.";
		case "in-progress":
			return "No shoots are currently in progress.";
		case "past":
			return "No past shoots found.";
		default:
			return "You don't have any shoots assigned to you.";
	}
}

function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
}) {
	return (
		<Card>
			<CardContent className="p-12 text-center">
				<Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
