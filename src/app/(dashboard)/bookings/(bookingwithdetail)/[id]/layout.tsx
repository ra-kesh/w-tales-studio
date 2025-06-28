"use client";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useBookingListColumns } from "./_components/booking-list-columns";
import { BookingListPagination } from "./_components/booking-list-pagination";
import {
	Suspense,
	unstable_ViewTransition as ViewTransition,
	useMemo,
} from "react";
import { useBookings } from "@/hooks/use-bookings";
import { BookingTable } from "../../_components/booking-table/booking-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const BookingDetailLayout = ({ children }: { children: React.ReactNode }) => {
	const columns = useBookingListColumns();
	const { data, isLoading } = useBookings();

	const defaultData = useMemo(() => [], []);
	const { table } = useBookingTable({
		data: data?.data ?? defaultData,
		pageCount: data?.pageCount ?? 0,
		columns,
		getRowId: (originalRow) => originalRow.id.toString(),
		shallow: false,
		clearOnDefault: true,
	});

	return (
		<ViewTransition name="experimental-label">
			<div className="flex-1 min-w-0 border-b">
				<TooltipProvider delayDuration={0}>
					<ResizablePanelGroup
						direction="horizontal"
						onLayout={(sizes: number[]) => {
							document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
								sizes,
							)}`;
						}}
						className="h-full max-h-[800px] items-stretch "
					>
						<ResizablePanel defaultSize={30} minSize={28}>
							<div className="py-6">
								<DataTableToolbar table={table} className="my-2" />
								{isLoading ? (
									<DataTableSkeleton
										columnCount={1}
										filterCount={0}
										cellWidths={["15rem"]}
										shrinkZero
									/>
								) : (
									<BookingTable table={table} columns={columns}>
										<BookingListPagination table={table} />
									</BookingTable>
								)}
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={70} minSize={65}>
							<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
						</ResizablePanel>
					</ResizablePanelGroup>
				</TooltipProvider>
			</div>
		</ViewTransition>
	);
};

export default BookingDetailLayout;
