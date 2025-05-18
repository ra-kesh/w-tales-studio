"use client";

import * as React from "react";
import { Fragment, useState } from "react";
import type { Deliverable } from "@/lib/db/schema";
import { format } from "date-fns";
import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Package,
	FileText,
	Edit,
	Plus,
	DollarSign,
	Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";

interface BookingDeliverablesProps {
	deliverables: Deliverable[];
	bookingId?: string | number;
}

// Reusable component for displaying deliverables
function DeliverablesList({
	deliverables,
	isCompleted = false,
	bookingId,
}: {
	deliverables: Deliverable[];
	isCompleted?: boolean;
	bookingId?: string | number;
}) {
	const [expandedDeliverables, setExpandedDeliverables] = useState<
		Record<string, boolean>
	>({});

	const { setParams } = useDeliverableParams();

	const toggleExpanded = (
		deliverableId: number | string,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		setExpandedDeliverables((prev) => ({
			...prev,
			[deliverableId]: !prev[deliverableId],
		}));
	};

	if (deliverables.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				{isCompleted
					? "No completed deliverables yet"
					: "No pending deliverables scheduled"}
			</div>
		);
	}

	return (
		<div className="overflow-hidden">
			<table className="w-full text-left">
				<thead className="sr-only">
					<tr>
						<th>Title</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody>
					{deliverables.map((deliverable) => (
						<React.Fragment key={deliverable.id}>
							<tr>
								<td className="relative py-5 px-4 w-full">
									<div className="flex flex-col gap-2">
										<div className="flex justify-between">
											<div className="flex flex-col items-start">
												<div className="flex items-center gap-2">
													<div className="text-sm font-medium leading-6 text-gray-900">
														{deliverable.title || "Untitled Deliverable"}
													</div>
													{isCompleted && (
														<div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
															Completed
														</div>
													)}
													{deliverable.dueDate && (
														<div className="text-xs text-gray-500">
															Due:{" "}
															{format(
																new Date(deliverable.dueDate as string),
																"MMM d, yyyy",
															)}
														</div>
													)}

													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 rounded-full hover:bg-gray-100 ml-2"
														onClick={() =>
															setParams({
																deliverableId: deliverable.id.toString(),
															})
														}
													>
														<Edit className="h-3.5 w-3.5 text-gray-500" />
														<span className="sr-only">Edit deliverable</span>
													</Button>
												</div>
											</div>
											<div className="flex flex-col items-end">
												<div className="flex items-center text-sm text-gray-500">
													<DollarSign className="h-4 w-4 mr-1 text-gray-400" />
													{Number(deliverable.cost) > 0
														? `₹${Number(deliverable.cost).toLocaleString()}`
														: "No additional cost"}
												</div>
												<div className="flex items-center justify-end text-sm text-gray-500">
													<Package className="h-4 w-4 mr-1 text-gray-400" />
													{deliverable.quantity
														? `Quantity: ${deliverable.quantity}`
														: "Quantity: 1"}
												</div>
											</div>
										</div>

										<div className="w-full border rounded-md p-1">
											<div
												onClick={(e) => toggleExpanded(deliverable.id, e)}
												className="p-2 flex items-center justify-between cursor-pointer"
											>
												<div className="flex items-center gap-2">
													<FileText className="h-4 w-4 text-gray-500" />
													<span className="text-sm font-medium">
														Details & Crew
													</span>
												</div>
												{expandedDeliverables[deliverable.id] ? (
													<ChevronUp className="h-4 w-4 text-gray-500" />
												) : (
													<ChevronDown className="h-4 w-4 text-gray-500" />
												)}
											</div>
											{expandedDeliverables[deliverable.id] && (
												<div className="bg-gray-50 rounded-md m-2 p-3">
													<div className="grid grid-cols-2 gap-4">
														<div>
															<div className="text-xs text-gray-500 mb-1">
																Title
															</div>
															<div className="text-sm">
																{deliverable.title || "Untitled"}
															</div>
														</div>
														<div>
															<div className="text-xs text-gray-500 mb-1">
																Due Date
															</div>
															<div className="text-sm">
																{deliverable.dueDate
																	? format(
																			new Date(deliverable.dueDate as string),
																			"MMMM d, yyyy",
																		)
																	: "No due date"}
															</div>
														</div>
														<div>
															<div className="text-xs text-gray-500 mb-1">
																Cost
															</div>
															<div className="text-sm">
																{Number(deliverable.cost) > 0
																	? `₹${Number(
																			deliverable.cost,
																		).toLocaleString()}`
																	: "No additional cost"}
															</div>
														</div>
														<div>
															<div className="text-xs text-gray-500 mb-1">
																Quantity
															</div>
															<div className="text-sm">
																{deliverable.quantity || "1"}
															</div>
														</div>
														<div className="col-span-2">
															<div className="text-xs text-gray-500 mb-1">
																Status
															</div>
															<div className="text-sm">
																{isCompleted ? (
																	<span className="text-green-600 flex items-center">
																		<CheckCircle className="h-3.5 w-3.5 mr-1" />
																		Completed
																	</span>
																) : (
																	<span className="text-amber-600">
																		Pending
																	</span>
																)}
															</div>
														</div>

														{/* Crew assignments section */}
														{deliverable.deliverablesAssignments &&
															deliverable.deliverablesAssignments.length >
																0 && (
																<div className="col-span-2 mt-2">
																	<div className="text-xs text-gray-500 mb-2">
																		Assigned Crew
																	</div>
																	<div className="space-y-2">
																		{deliverable.deliverablesAssignments.map(
																			(assignment) => {
																				const name =
																					assignment.crew?.member?.user?.name ||
																					assignment.crew?.name ||
																					"Unnamed";
																				const initials = name
																					.split(" ")
																					.map((n) => n[0])
																					.join("");

																				return (
																					<div
																						key={assignment.id}
																						className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
																					>
																						<div className="flex items-center gap-3">
																							<Avatar className="h-8 w-8">
																								<AvatarFallback className="bg-primary/10 text-primary">
																									{initials}
																								</AvatarFallback>
																							</Avatar>
																							<div>
																								<div className="font-medium">
																									{name}
																								</div>
																								<div className="text-sm text-gray-500">
																									{assignment.crew?.role ||
																										"No role"}
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
																							{assignment.crew
																								?.specialization && (
																								<div className="ml-2 text-sm text-gray-500">
																									{
																										assignment.crew
																											.specialization
																									}
																								</div>
																							)}
																						</div>
																					</div>
																				);
																			},
																		)}
																	</div>
																</div>
															)}

														{(!deliverable.deliverablesAssignments ||
															deliverable.deliverablesAssignments.length ===
																0) && (
															<div className="col-span-2 mt-2">
																<div className="text-xs text-gray-500 mb-2">
																	Assigned Crew
																</div>
																<div className="flex items-center text-sm text-gray-500">
																	<Users className="h-4 w-4 mr-2 text-gray-400" />
																	No crew assigned to this deliverable
																</div>
															</div>
														)}
													</div>
												</div>
											)}
										</div>
									</div>
									<div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
									<div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
								</td>
							</tr>
						</React.Fragment>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function BookingDeliverables({
	deliverables = [],
	bookingId,
}: BookingDeliverablesProps) {
	const { setParams } = useDeliverableParams();

	// Filter deliverables by status
	const pendingDeliverables = deliverables.filter(
		(d) => d.status !== "completed",
	);
	const completedDeliverables = deliverables.filter(
		(d) => d.status === "completed",
	);

	// Calculate completion percentage
	const completionPercentage =
		deliverables.length > 0
			? Math.round((completedDeliverables.length / deliverables.length) * 100)
			: 0;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Deliverables</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						setParams({
							createDeliverable: "true",
							bookingId: bookingId?.toString(),
						})
					}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Deliverable
				</Button>
			</div>

			<Card>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>{completionPercentage}% complete</span>
							<span>
								{completedDeliverables.length}/{deliverables.length}{" "}
								deliverables
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

			<Tabs defaultValue="pending" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="pending">
						Pending ({pendingDeliverables.length})
					</TabsTrigger>
					<TabsTrigger value="completed">
						Completed ({completedDeliverables.length})
					</TabsTrigger>
				</TabsList>
				<TabsContent value="pending" className="mt-6">
					<DeliverablesList
						deliverables={pendingDeliverables}
						bookingId={bookingId}
					/>
				</TabsContent>
				<TabsContent value="completed" className="mt-6">
					<DeliverablesList
						deliverables={completedDeliverables}
						isCompleted
						bookingId={bookingId}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
