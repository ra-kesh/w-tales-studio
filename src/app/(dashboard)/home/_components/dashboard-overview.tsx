"use client";

import { Camera, CheckCircle2, LayoutGrid, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAssignments } from "@/hooks/use-assignments";
import { DeliverableCard } from "./deliverable-card";
import { ShootCard } from "./shoots-card";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const filterOptions = [
	// {
	// 	id: "all",
	// 	label: "All Assignments",
	// 	icon: LayoutGrid,
	// 	description: "View all your assignments",
	// },
	{
		id: "shoots",
		label: "Shoots",
		icon: Camera,
		description: "Your photography assignments",
	},
	{
		id: "tasks",
		label: "Tasks",
		icon: CheckCircle2,
		description: "Your task assignments",
	},
	{
		id: "deliverables",
		label: "Deliverables",
		icon: Package,
		description: "Your deliverable assignments",
	},
];

export function DashboardOverview() {
	const [selectedFilter, setSelectedFilter] = useState("shoots");
	const { data, isLoading, isError } = useAssignments({});

	const filteredAssignments = useMemo(() => {
		if (!data) return { shoots: [], tasks: [], deliverables: [] };

		const { shoots = [], tasks = [], deliverables = [] } = data.data;

		switch (selectedFilter) {
			case "shoots":
				return { shoots, tasks: [], deliverables: [] };
			case "tasks":
				return { shoots: [], tasks, deliverables: [] };
			case "deliverables":
				return { shoots: [], tasks: [], deliverables };
			default:
				return { shoots, tasks, deliverables };
		}
	}, [data, selectedFilter]);

	if (isLoading) {
		return <div>Loading assignments...</div>;
	}

	if (isError || !data) {
		return <div>Could not load assignments. Please try again later.</div>;
	}

	const selectedOption = filterOptions.find(
		(option) => option.id === selectedFilter,
	);
	const totalCount =
		filteredAssignments.shoots.length +
		filteredAssignments.tasks.length +
		filteredAssignments.deliverables.length;

	return (
		<div className="grid grid-cols-12 gap-12">
			{/* Sidebar Menu */}
			<div className="col-span-3 flex-shrink-0">
				<Card className="border border-gray-200 py-0">
					<CardContent className="p-0">
						<div className="p-4 border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">
								Filter Assignments
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Organize your assignments by type
							</p>
						</div>

						<nav className="p-2">
							{filterOptions.map((option) => {
								const Icon = option.icon;
								const isSelected = selectedFilter === option.id;

								// Get count for each category
								let count = 0;
								if (option.id === "all") {
									count =
										(data?.data.shoots?.length || 0) +
										(data?.data.tasks?.length || 0) +
										(data?.data.deliverables?.length || 0);
								} else if (option.id === "shoots") {
									count = data?.data.shoots?.length || 0;
								} else if (option.id === "tasks") {
									count = data?.data.tasks?.length || 0;
								} else if (option.id === "deliverables") {
									count = data?.data.deliverables?.length || 0;
								}

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
											<div className="flex items-center justify-between">
												<p
													className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-900"}`}
												>
													{option.label}
												</p>
												<span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
													{count}
												</span>
											</div>
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
			<div className="flex-1 col-span-9 space-y-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{selectedOption?.label}
					</h2>
					<p className="text-sm text-gray-600">
						{selectedOption?.description} • {totalCount} assignment
						{totalCount !== 1 ? "s" : ""}
					</p>
				</div>

				<ScrollArea className="h-[70vh] pr-2"><div className="space-y-6">
					{totalCount > 0 ? (
						<>
							{/* Shoots Section */}
							{filteredAssignments.shoots.length > 0 && (
								<div className="space-y-4">
									{selectedFilter === "all" && (
										<div className="flex items-center gap-2">
											<Camera className="h-5 w-5 text-gray-600" />
											<h3 className="text-lg font-medium text-gray-900">
												Shoots ({filteredAssignments.shoots.length})
											</h3>
										</div>
									)}
									<ul role="list" className="divide-y divide-gray-100">
										{filteredAssignments.shoots.map((assignment) => (
											<ShootCard key={assignment.id} assignment={assignment} />
										))}
									</ul>
								</div>
							)}

							{/* Tasks Section */}
							{filteredAssignments.tasks.length > 0 && (
								<div className="space-y-4">
									{selectedFilter === "all" && (
										<div className="flex items-center gap-2">
											<CheckCircle2 className="h-5 w-5 text-gray-600" />
											<h3 className="text-lg font-medium text-gray-900">
												Tasks ({filteredAssignments.tasks.length})
											</h3>
										</div>
									)}
									<ul role="list" className="divide-y divide-gray-100">
										{filteredAssignments.tasks.map((assignment) => (
											<TaskCard key={assignment.id} assignment={assignment} />
										))}
									</ul>
								</div>
							)}

							{/* Deliverables Section */}
							{filteredAssignments.deliverables.length > 0 && (
								<div className="space-y-4">
									{selectedFilter === "all" && (
										<div className="flex items-center gap-2">
											<Package className="h-5 w-5 text-gray-600" />
											<h3 className="text-lg font-medium text-gray-900">
												Deliverables ({filteredAssignments.deliverables.length})
											</h3>
										</div>
									)}
									<ul role="list" className="divide-y divide-gray-100">
										{filteredAssignments.deliverables.map((assignment) => (
											<DeliverableCard
												key={assignment.id}
												assignment={assignment}
											/>
										))}
									</ul>
								</div>
							)}
						</>
					) : (
						<EmptyState
							icon={selectedOption?.icon || LayoutGrid}
							title={`No ${selectedOption?.label || "Assignments"} Found`}
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
		case "shoots":
			return "You don't have any shoots assigned to you.";
		case "tasks":
			return "You don't have any tasks assigned to you.";
		case "deliverables":
			return "You don't have any deliverables assigned to you.";
		default:
			return "You don't have any assignments at the moment.";
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
