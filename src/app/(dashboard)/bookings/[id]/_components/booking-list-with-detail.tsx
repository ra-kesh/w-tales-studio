"use client";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { BookingList } from "./booking-list";

import type {
	Booking,
	BookingDetail,
	Crew,
	Deliverable,
	Expense,
	PaymentSchedule,
	ReceivedAmount,
	Shoot,
	Task,
} from "@/lib/db/schema";
import { BookingDetails } from "./booking-details";

// export type BookingDetail = Booking & {
// 	shoots: Shoot[];
// 	deliverables: Deliverable[];
// 	receivedAmounts: ReceivedAmount[];
// 	paymentSchedules: PaymentSchedule[];
// 	expenses: Expense[];
// 	crews: Crew[];
// 	tasks: Task[];
// };

const BookingListWithDetail = ({
	defaultLayout = [32, 68],
	booking,
}: { defaultLayout?: number[]; booking: BookingDetail }) => {
	return (
		<div className="flex-1 min-w-0 rounded-md border">
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
						<BookingList />
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
						<BookingDetails booking={booking} />
					</ResizablePanel>
				</ResizablePanelGroup>
			</TooltipProvider>
		</div>
	);
};

export default BookingListWithDetail;
