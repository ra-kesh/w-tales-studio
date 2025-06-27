"use client";

import React from "react";
import {
	CustomTabsContent,
	CustomTabsList,
	CustomTabsTrigger,
	Tabs,
} from "@/components/ui/tabs";
import { useReceivedPayments, usePaymentSchedules } from "@/hooks/use-payments";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useReceivedPaymentsColumns } from "./_component/received-payments-columns";
import { useScheduledPaymentsColumns } from "./_component/scheduled-payments-columns";
import { PaymentsTable } from "./_component/payment-table";
import { useBookingTable } from "@/hooks/use-booking-table";

export default function PaymentsPage() {
	const { data: receivedData, isLoading: isReceivedLoading } =
		useReceivedPayments();
	const { data: scheduledData, isLoading: isScheduledLoading } =
		usePaymentSchedules();

	const receivedColumns = useReceivedPaymentsColumns();
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

				<CustomTabsContent value="received" className="mt-6">
					{/* <DataTableToolbar table={receivedTable}>
						<Button size="sm">Add Received Payment</Button>
					</DataTableToolbar> */}
					{isReceivedLoading ? (
						<DataTableSkeleton columnCount={5} />
					) : (
						<PaymentsTable table={receivedTable} columns={receivedColumns} />
					)}
				</CustomTabsContent>

				<CustomTabsContent value="scheduled" className="mt-6">
					{/* <DataTableToolbar table={scheduledTable}>
						<Button size="sm">Add Scheduled Payment</Button>
					</DataTableToolbar> */}
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
