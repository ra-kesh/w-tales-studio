"use client";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useBookingListColumns } from "./_components/booking-list-columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Booking } from "@/lib/db/schema";
import { BookingListToolbar } from "./_components/booking-list-toolbar";
import { BookingList } from "./_components/booking-list";
import { BookingListPagination } from "./_components/booking-list-pagination";
import { Suspense, unstable_ViewTransition as ViewTransition } from "react";

const BookingDetailLayout = ({ children }: { children: React.ReactNode }) => {
	const columns = useBookingListColumns();
	const { table } = useBookingTable(columns as ColumnDef<Booking>[]);
	return (
		<ViewTransition name="experimental-label">
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
						<ResizablePanel defaultSize={32} minSize={30}>
							<BookingListToolbar table={table} />
							<BookingList table={table} columns={columns} />
							<BookingListPagination table={table} />
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={68} minSize={30}>
							<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
						</ResizablePanel>
					</ResizablePanelGroup>
				</TooltipProvider>
			</div>
		</ViewTransition>
	);
};

export default BookingDetailLayout;
