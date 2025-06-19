"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecentBooking {
	id: number;
	name: string;
	clientName: string | null;
	createdAt: string;
}

export function RecentBookingDashboard({
	recentBookings,
}: {
	recentBookings: RecentBooking[];
}) {
	const bookingColumns: ColumnDef<RecentBooking>[] = [
		{
			accessorKey: "name",
			header: "Booking Name",
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
		{
			accessorKey: "clientName",
			header: "Client Name",
		},
		{
			accessorKey: "createdAt",
			header: () => <div className="text-right">Created At</div>,
			cell: ({ row }) => (
				<div className="text-right">
					{format(new Date(row.original.createdAt), "MMM d, yyyy")}
				</div>
			),
		},
	];

	const router = useRouter();

	return (
		<div className="flex flex-col w-full space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-left flex-col">
					<h2 className="text-base/7 font-semibold text-gray-900">
						Recent Bookings
					</h2>
					<p className="text-sm/6 text-gray-500">
						Some of the most recent bookings made in the system.
					</p>
				</div>
				{/* change this to ghost button */}
				<Button
					onClick={() => router.push("/bookings")}
					className=" bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
				>
					View All
					<ArrowUpRight size={4} />
				</Button>
			</div>

			<DataTable columns={bookingColumns} data={recentBookings} />
		</div>
	);
}
