"use client";

import { isFuture, isPast, isToday, startOfDay } from "date-fns";
import {
	AlertTriangle,
	Archive,
	Calendar,
	CheckCircle2,
	Clock,
	Package,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAllDeliverableAssignments } from "@/hooks/use-all-deliverables-assignment";
import { DeliverableCard } from "./deliverable-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const filterOptions = [
	{
		id: "all",
		label: "All Deliverables",
		icon: Package,
		description: "View all your assigned deliverables",
	},
	{
		id: "pending",
		label: "Pending Deliverables",
		icon: Clock,
		description: "Deliverables that need to be completed",
	},
	{
		id: "overdue",
		label: "Overdue Deliverables",
		icon: AlertTriangle,
		description: "Deliverables past their due date",
	},
	{
		id: "due-today",
		label: "Due Today",
		icon: Calendar,
		description: "Deliverables due today",
	},
	{
		id: "upcoming",
		label: "Upcoming Deliverables",
		icon: Calendar,
		description: "Deliverables due in the future",
	},
	{
		id: "delivered",
		label: "Delivered",
		icon: CheckCircle2,
		description: "Successfully delivered items",
	},
];

export function AllDeliverables() {
	const [selectedFilter, setSelectedFilter] = useState("all");
	const { data, isLoading, isError, hasNextPage, fetchNextPage } =
		useAllDeliverableAssignments();

	const filteredDeliverables = useMemo(() => {
		if (!data) return [];

		const allDeliverables = data.pages.flatMap((page) => page.data);
		// const today = startOfDay(new Date());

		switch (selectedFilter) {
			case "pending":
				return allDeliverables.filter(
					(assignment) =>
						assignment.deliverable.status !== "delivered" &&
						assignment.deliverable.status !== "cancelled",
				);

			case "overdue":
				return allDeliverables.filter((assignment) => {
					const dueDate = assignment.deliverable.dueDate
						? startOfDay(new Date(assignment.deliverable.dueDate))
						: null;
					return (
						dueDate &&
						isPast(dueDate) &&
						!isToday(dueDate) &&
						assignment.deliverable.status !== "delivered"
					);
				});

			case "due-today":
				return allDeliverables.filter((assignment) => {
					const dueDate = assignment.deliverable.dueDate
						? new Date(assignment.deliverable.dueDate)
						: null;
					return (
						dueDate &&
						isToday(dueDate) &&
						assignment.deliverable.status !== "delivered"
					);
				});

			case "upcoming":
				return allDeliverables.filter((assignment) => {
					const dueDate = assignment.deliverable.dueDate
						? startOfDay(new Date(assignment.deliverable.dueDate))
						: null;
					return (
						dueDate &&
						isFuture(dueDate) &&
						assignment.deliverable.status !== "delivered"
					);
				});

			case "delivered":
				return allDeliverables.filter(
					(assignment) => assignment.deliverable.status === "delivered",
				);

			default:
				return allDeliverables;
		}
	}, [data, selectedFilter]);

	if (isLoading) {
		return <div>Loading deliverables...</div>;
	}

	if (isError || !data) {
		return <div>Could not load deliverables. Please try again later.</div>;
	}

	const selectedOption = filterOptions.find(
		(option) => option.id === selectedFilter,
	);

	return (
		<div className="grid grid-cols-11 gap-12">
			{/* Sidebar Menu */}
			<div className="col-span-3 flex-shrink-0">
				<Card className="border border-gray-200 py-0">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">
								Filter Deliverables
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Organize your deliverables by status and date
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
													? "bg-blue-50 text-blue-700 border border-blue-200"
													: "text-gray-700 hover:bg-gray-50"
											}
                    `}
									>
										<Icon
											className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-gray-400"}`}
										/>
										<div className="flex-1 min-w-0">
											<p
												className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-900"}`}
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
			<div className="flex-1 col-span-8 space-y-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{selectedOption?.label}
					</h2>
					<p className="text-sm text-gray-600">
						{selectedOption?.description} • {filteredDeliverables.length}{" "}
						deliverable{filteredDeliverables.length !== 1 ? "s" : ""}
					</p>
				</div>

				<ScrollArea className="h-[70vh] pr-2"><div className="space-y-4">
					{filteredDeliverables.length > 0 ? (
						<>
							<ul role="list" className="divide-y divide-gray-100">
								{filteredDeliverables.map((assignment) => (
									<DeliverableCard
										key={assignment.id}
										assignment={assignment}
									/>
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
							icon={selectedOption?.icon || Package}
							title={`No ${selectedOption?.label || "Deliverables"} Found`}
							description={getEmptyStateDescription(selectedFilter)}
						/>
					)}
				</div></ScrollArea>
			</div>
		</div>
	);
}

function getEmptyStateDescription(filter: string): string {
	switch (filter) {
		case "pending":
			return "Great! You don't have any pending deliverables.";
		case "overdue":
			return "No overdue deliverables. You're on track!";
		case "due-today":
			return "No deliverables are due today.";
		case "upcoming":
			return "No upcoming deliverables scheduled.";
		case "delivered":
			return "No delivered items found.";
		default:
			return "You don't have any deliverables assigned to you.";
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
