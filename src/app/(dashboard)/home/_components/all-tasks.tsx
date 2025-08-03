"use client";

import { isFuture, isPast, isToday, startOfDay } from "date-fns";
import {
	AlertTriangle,
	Calendar,
	CheckCircle2,
	Clock,
	List,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAllTaskAssignments } from "@/hooks/use-all-task-assignment";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const filterOptions = [
	{
		id: "all",
		label: "All Tasks",
		icon: List,
		description: "View all your assigned tasks",
	},
	{
		id: "pending",
		label: "Pending Tasks",
		icon: Clock,
		description: "Tasks that need to be completed",
	},
	{
		id: "overdue",
		label: "Overdue Tasks",
		icon: AlertTriangle,
		description: "Tasks past their due date",
	},
	{
		id: "due-today",
		label: "Due Today",
		icon: Calendar,
		description: "Tasks due today",
	},
	{
		id: "upcoming",
		label: "Upcoming Tasks",
		icon: Calendar,
		description: "Tasks due in the future",
	},
	{
		id: "completed",
		label: "Completed Tasks",
		icon: CheckCircle2,
		description: "Successfully completed tasks",
	},
];

export function AllTasks() {
	const [selectedFilter, setSelectedFilter] = useState("all");
	const { data, isLoading, isError, hasNextPage, fetchNextPage } =
		useAllTaskAssignments();

	const filteredTasks = useMemo(() => {
		if (!data) return [];

		const allTasks = data.pages.flatMap((page) => page.data);
		const today = startOfDay(new Date());

		switch (selectedFilter) {
			case "pending":
				return allTasks.filter(
					(assignment) =>
						assignment.task.status !== "completed" &&
						assignment.task.status !== "cancelled",
				);

			case "overdue":
				return allTasks.filter((assignment) => {
					const dueDate = assignment.task.dueDate
						? startOfDay(new Date(assignment.task.dueDate))
						: null;
					return (
						dueDate &&
						isPast(dueDate) &&
						!isToday(dueDate) &&
						assignment.task.status !== "completed"
					);
				});

			case "due-today":
				return allTasks.filter((assignment) => {
					const dueDate = assignment.task.dueDate
						? new Date(assignment.task.dueDate)
						: null;
					return (
						dueDate &&
						isToday(dueDate) &&
						assignment.task.status !== "completed"
					);
				});

			case "upcoming":
				return allTasks.filter((assignment) => {
					const dueDate = assignment.task.dueDate
						? startOfDay(new Date(assignment.task.dueDate))
						: null;
					return (
						dueDate &&
						isFuture(dueDate) &&
						assignment.task.status !== "completed"
					);
				});

			case "completed":
				return allTasks.filter(
					(assignment) => assignment.task.status === "completed",
				);

			default:
				return allTasks;
		}
	}, [data, selectedFilter]);

	if (isLoading) {
		return <div>Loading tasks...</div>;
	}

	if (isError || !data) {
		return <div>Could not load tasks. Please try again later.</div>;
	}

	const selectedOption = filterOptions.find(
		(option) => option.id === selectedFilter,
	);

	return (
		<div className="grid grid-cols-12 gap-8">
			<div className="col-span-3 flex-shrink-0">
				<Card className="border border-gray-200 py-0">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">Filter Tasks</h3>
							<p className="text-sm text-gray-500 mt-1">
								Organize your tasks by status and date
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

			<div className="flex-1 col-span-9 space-y-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{selectedOption?.label}
					</h2>
					<p className="text-sm text-gray-600">
						{selectedOption?.description} • {filteredTasks.length} task
						{filteredTasks.length !== 1 ? "s" : ""}
					</p>
				</div>

				<ScrollArea className="h-[70vh] pr-2"><div className="space-y-4">
					{filteredTasks.length > 0 ? (
						<>
							<ul role="list" className="divide-y divide-gray-100">
								{filteredTasks.map((assignment) => (
									<TaskCard key={assignment.id} assignment={assignment} />
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
							icon={selectedOption?.icon || CheckCircle2}
							title={`No ${selectedOption?.label || "Tasks"} Found`}
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
			return "Great! You don't have any pending tasks.";
		case "overdue":
			return "No overdue tasks. You're on track!";
		case "due-today":
			return "No tasks are due today.";
		case "upcoming":
			return "No upcoming tasks scheduled.";
		case "completed":
			return "No completed tasks found.";
		default:
			return "You don't have any tasks assigned to you.";
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
