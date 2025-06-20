"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNowStrict } from "date-fns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";

interface OverdueTask {
	id: number;
	description: string;
	bookingName: string | null;
	dueDate: string;
}

interface OverdueDeliverable {
	id: number;
	title: string;
	bookingName: string | null;
	dueDate: string;
}

interface UnstaffedShoot {
	id: number;
	title: string;
	bookingName: string | null;
	shootDate: string;
}

interface ActionItemsData {
	overdueTasks: OverdueTask[];
	overdueDeliverables: OverdueDeliverable[];
	unstaffedShoots: UnstaffedShoot[];
}

export function OverdueWork({
	actionItems,
}: {
	actionItems: ActionItemsData;
}) {
	const taskColumns: ColumnDef<OverdueTask>[] = [
		{
			accessorKey: "description",
			header: "Task Description",
			cell: ({ row }) => (
				<div className="font-medium">{row.original.description}</div>
			),
		},
		{
			accessorKey: "bookingName",
			header: "Booking",
		},
		{
			accessorKey: "dueDate",
			header: () => <div className="text-right">Overdue By</div>,
			cell: ({ row }) => (
				<div className="text-right text-red-600">
					{formatDistanceToNowStrict(new Date(row.original.dueDate))} ago
				</div>
			),
		},
	];

	const deliverableColumns: ColumnDef<OverdueDeliverable>[] = [
		{
			accessorKey: "title",
			header: "Deliverable",
			cell: ({ row }) => (
				<div className="font-medium">{row.original.title}</div>
			),
		},
		{
			accessorKey: "bookingName",
			header: "Booking",
		},
		{
			accessorKey: "dueDate",
			header: () => <div className="text-right">Overdue By</div>,
			cell: ({ row }) => (
				<div className="text-right text-red-600">
					{formatDistanceToNowStrict(new Date(row.original.dueDate))} ago
				</div>
			),
		},
	];

	const shootColumns: ColumnDef<UnstaffedShoot>[] = [
		{
			accessorKey: "title",
			header: "Shoot Title",
			cell: ({ row }) => (
				<div className="font-medium">{row.original.title}</div>
			),
		},
		{
			accessorKey: "bookingName",
			header: "Booking",
		},
		{
			accessorKey: "shootDate",
			header: () => <div className="text-right">Shoot Date</div>,
			cell: ({ row }) => (
				<div className="text-right">
					{format(new Date(row.original.shootDate), "MMM d, yyyy")}
				</div>
			),
		},
	];

	return (
		<Tabs defaultValue="tasks" className="w-full">
			<div className="flex items-center">
				<TabsList className="bg-gray-100">
					<TabsTrigger value="tasks">Overdue Tasks</TabsTrigger>
					<TabsTrigger value="deliverables">Overdue Deliverables</TabsTrigger>
					<TabsTrigger value="shoots">Unstaffed Shoots</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value="tasks" className="mt-4">
				<DataTable columns={taskColumns} data={actionItems.overdueTasks} />
			</TabsContent>

			<TabsContent value="deliverables" className="mt-4">
				<DataTable
					columns={deliverableColumns}
					data={actionItems.overdueDeliverables}
				/>
			</TabsContent>

			<TabsContent value="shoots" className="mt-4">
				<DataTable columns={shootColumns} data={actionItems.unstaffedShoots} />
			</TabsContent>
		</Tabs>
	);
}
