"use client";

import { Input } from "@/components/ui/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBookingDetail, useBookings } from "@/hooks/use-bookings";
import { Search } from "lucide-react";
import React from "react";
import { BookingTable } from "../../_components/booking-table/booking-table";
import { useBookingColumns } from "../../_components/booking-table/booking-table-columns";
import { BookingList } from "./booking-list";
import { useBookingListColumns } from "./booking-list-columns";
import { BookingDetails } from "./booking-details";

const BookingListWithDetail = ({ defaultLayout = [32, 68], booking }) => {
	const { data } = useBookings();
	const columns = useBookingListColumns();
	const defaultData = React.useMemo(() => [], []);

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
						<BookingList data={data?.data || defaultData} columns={columns} />
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
