"use client";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { Suspense } from "react";
import { BookingList } from "./booking-list";

import type { Booking, BookingDetail } from "@/lib/db/schema";
import { BookingDetails } from "./booking-details";
import { useBookingListColumns } from "./booking-list-columns";
import { useBookingTable } from "@/hooks/use-booking-table";
import { BookingListToolbar } from "./booking-list-toolbar";
import type { ColumnDef } from "@tanstack/react-table";

const BookingListWithDetail = ({
	defaultLayout = [32, 68],
	booking,
}: {
	defaultLayout?: number[];
	booking: BookingDetail;
}) => {
	const columns = useBookingListColumns();
	const { table } = useBookingTable(columns as ColumnDef<Booking>[]);
	return (
		<div className="flex-1 min-w-0  border-y">
			<TooltipProvider delayDuration={0}>
				<ResizablePanelGroup
					direction="horizontal"
					onLayout={(sizes: number[]) => {
						document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
							sizes,
						)}`;
					}}
					className="h-full max-h-[800px] items-stretch"
				>
					<ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
						<BookingListToolbar table={table} />
						<BookingList table={table} columns={columns} />
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
						<Suspense fallback={<div>Loading...</div>}>
							<BookingDetails booking={booking} />
						</Suspense>
					</ResizablePanel>
				</ResizablePanelGroup>
			</TooltipProvider>
		</div>
	);
};

export default BookingListWithDetail;
