"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { Camera, CheckCircle2, Package } from "lucide-react";
import { useAssignments } from "@/hooks/use-assignments";
import { Card, CardContent } from "@/components/ui/card";
import { ShootCard } from "./shoots-card";
import { TaskCard } from "./task-card";
import { DeliverableCard } from "./deliverable-card";

export function DashboardOverview() {
	const { data, isLoading, isError } = useAssignments({});

	if (isLoading) {
		return <div>Loading assignments...</div>;
	}

	if (isError || !data) {
		return <div>Could not load your assignments. Please try again later.</div>;
	}

	const { shoots = [], tasks = [], deliverables = [] } = data.data;

	return (
		<div className="container mx-auto max-w-6xl">
			<Accordion
				type="multiple"
				defaultValue={["shoots", "tasks", "deliverables"]}
				className="w-full space-y-0 rounded-lg border"
			>
				<AccordionItem value="shoots">
					<AccordionTrigger className="px-6 text-lg font-medium">
						<div className="flex items-center gap-3">
							<Camera className="h-5 w-5" />
							<span>Shoots</span>
							<span className="text-sm font-normal text-muted-foreground">
								({shoots.length})
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-6 pb-6">
						{shoots.length > 0 ? (
							<div className="space-y-4">
								{shoots.map((assignment) => (
									<ShootCard key={assignment.id} assignment={assignment} />
								))}
							</div>
						) : (
							<EmptyState
								icon={Camera}
								title="No Shoots Assigned"
								description="You have no upcoming shoots."
							/>
						)}
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="tasks">
					<AccordionTrigger className="px-6 text-lg font-medium">
						<div className="flex items-center gap-3">
							<CheckCircle2 className="h-5 w-5" />
							<span>Tasks</span>
							<span className="text-sm font-normal text-muted-foreground">
								({tasks.length})
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-6 pb-6">
						{tasks.length > 0 ? (
							<div className="space-y-4">
								{tasks.map((assignment) => (
									<TaskCard key={assignment.id} assignment={assignment} />
								))}
							</div>
						) : (
							<EmptyState
								icon={CheckCircle2}
								title="No Tasks Assigned"
								description="You have no pending tasks."
							/>
						)}
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="deliverables">
					<AccordionTrigger className="px-6 text-lg font-medium">
						<div className="flex items-center gap-3">
							<Package className="h-5 w-5" />
							<span>Deliverables</span>
							<span className="text-sm font-normal text-muted-foreground">
								({deliverables.length})
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-6 pb-6">
						{deliverables.length > 0 ? (
							<div className="space-y-4">
								{deliverables.map((assignment) => (
									<DeliverableCard
										key={assignment.id}
										assignment={assignment}
									/>
								))}
							</div>
						) : (
							<EmptyState
								icon={Package}
								title="No Deliverables Assigned"
								description="You have no deliverables to work on."
							/>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

function EmptyState({
	icon: Icon,
	title,
	description,
}: { icon: React.ElementType; title: string; description: string }) {
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
