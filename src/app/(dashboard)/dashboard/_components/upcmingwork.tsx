"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { parseAsString, useQueryState } from "nuqs";
import type { Deliverable, Shoot, Task } from "@/lib/db/schema";
import { DataTable } from "@/components/data-table/data-table";
import type { DashboardData } from "@/hooks/use-dashboard";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function UpcomingWork({
	operations,
}: {
	operations: DashboardData["operations"];
}) {
	const shootColumns: ColumnDef<Shoot>[] = [
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
			accessorKey: "date",
			header: () => <div className="text-right">Date</div>,
			cell: ({ row }) => (
				<div className="text-right">
					{format(new Date(row.original.date), "MMM d, yyyy")}
				</div>
			),
		},
	];

	const deliverableColumns: ColumnDef<Deliverable>[] = [
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
			header: () => <div className="text-right">Due Date</div>,
			cell: ({ row }) => (
				<div className="text-right">
					{row.original.dueDate
						? format(new Date(row.original.dueDate), "MMM d, yyyy")
						: "N/A"}
				</div>
			),
		},
	];

	const taskColumns: ColumnDef<Task>[] = [
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
			header: () => <div className="text-right">Due Date</div>,
			cell: ({ row }) => (
				<div className="text-right">
					{row.original.dueDate
						? format(new Date(row.original.dueDate), "MMM d, yyyy")
						: "N/A"}
				</div>
			),
		},
	];

	const [operationsInterval, setOperationsInterval] = useQueryState(
		"operationsInterval",
		parseAsString.withDefault("7d"),
	);

	return (
		<Tabs defaultValue="shoots" className="w-full ">
			<div className="flex items-center justify-between ">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select defaultValue="shoots">
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="shoots">Shoots</SelectItem>
						<SelectItem value="deliverables">Deliverables</SelectItem>
						<SelectItem value="tasks">Tasks</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="bg-gray-100  **:data-[slot=badge]:bg-gray-900/15 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="shoots">
						Shoots
						{operations.upcomingShoots.list.length > 0 && (
							<Badge variant="outline" className="ml-2">
								{operations.upcomingShoots.list.length}
							</Badge>
						)}
					</TabsTrigger>

					<TabsTrigger value="deliverables">
						Deliverables
						{operations.upcomingDeliverables.list.length > 0 && (
							<Badge variant="outline" className="ml-2">
								{operations.upcomingDeliverables.list.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="tasks">
						Tasks
						{operations.upcomingTasks.list.length > 0 && (
							<Badge variant="outline" className="ml-2">
								{operations.upcomingTasks.list.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<div className="flex items-center gap-2">
					<Select
						value={operationsInterval}
						onValueChange={setOperationsInterval}
					>
						<SelectTrigger className="h-6 w-[130px] text-xs font-semibold text-gray-900/90">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">Next 7 days</SelectItem>
							<SelectItem value="30d">Next 30 days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<TabsContent value="shoots" className="mt-4">
				<DataTable
					columns={shootColumns}
					data={operations.upcomingShoots.list}
				/>
			</TabsContent>

			<TabsContent value="deliverables" className="mt-4">
				<DataTable
					columns={deliverableColumns}
					data={operations.upcomingDeliverables.list}
				/>
			</TabsContent>

			<TabsContent value="tasks" className="mt-4">
				<DataTable columns={taskColumns} data={operations.upcomingTasks.list} />
			</TabsContent>
		</Tabs>
	);
}
