"use client";

import React from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
	CustomTabsContent,
	CustomTabsList,
	CustomTabsTrigger,
	Tabs,
} from "@/components/ui/tabs";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { usePaymentSchedules, useReceivedPayments } from "@/hooks/use-payments";
import { OpenRecviedPaymentSheet } from "./_component/open-received-payments-sheet";
import { PaymentsTable } from "./_component/payment-table";
import { useReceivedPaymentsColumns } from "./_component/received-payments-columns";
import { useScheduledPaymentsColumns } from "./_component/scheduled-payments-columns";

export default function PaymentsPage() {
	const { data: receivedData, isPending: isReceivedLoading } =
		useReceivedPayments();
	const { data: scheduledData, isPending: isScheduledLoading } =
		usePaymentSchedules();

	const {
		data: minimalBookingsResponse,
		isLoading: isMininmalBookingLoading,
		isFetched: isMinimalBookingFetched,
	} = useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const receivedColumns = useReceivedPaymentsColumns({
		minimalBookings: minimalBookings ?? [],
		isMininmalBookingLoading,
	});
	const scheduledColumns = useScheduledPaymentsColumns();

	const defaultData = React.useMemo(() => [], []);

	const { table: receivedTable } = useBookingTable({
		data: receivedData?.data ?? defaultData,
		columns: receivedColumns,
		pageCount: receivedData?.pageCount ?? 0,
	});

	const { table: scheduledTable } = useBookingTable({
		data: scheduledData?.data ?? defaultData,
		columns: scheduledColumns,
		pageCount: scheduledData?.pageCount ?? 0,
	});

	return (
		<main>
			<Tabs defaultValue="received">
				<CustomTabsList>
					<CustomTabsTrigger value="received">
						Received Payments
					</CustomTabsTrigger>
					<CustomTabsTrigger value="scheduled">
						Scheduled Payments
					</CustomTabsTrigger>
				</CustomTabsList>

				<CustomTabsContent value="received" className="mt-4">
					<DataTableToolbar table={receivedTable} className="mb-2">
						<OpenRecviedPaymentSheet />
					</DataTableToolbar>
					{isReceivedLoading ? (
						<DataTableSkeleton columnCount={5} />
					) : (
						<PaymentsTable table={receivedTable} columns={receivedColumns}>
							<DataTablePagination table={receivedTable} />
						</PaymentsTable>
					)}
				</CustomTabsContent>

				<CustomTabsContent value="scheduled" className="mt-4">
					<DataTableToolbar table={scheduledTable} className="mb-2">
						<Button size="sm">Add Scheduled Payment</Button>
					</DataTableToolbar>
					{isScheduledLoading ? (
						<DataTableSkeleton columnCount={5} />
					) : (
						<PaymentsTable table={scheduledTable} columns={scheduledColumns} />
					)}
				</CustomTabsContent>
			</Tabs>
		</main>
	);
}
