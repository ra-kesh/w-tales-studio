"use client";

import React from "react";
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
					<DataTableToolbar table={receivedTable}>
						<OpenRecviedPaymentSheet />
					</DataTableToolbar>
					{isReceivedLoading ? (
						<DataTableSkeleton columnCount={5} />
					) : (
						<PaymentsTable table={receivedTable} columns={receivedColumns} />
					)}
				</CustomTabsContent>

				<CustomTabsContent value="scheduled" className="mt-6">
					<DataTableToolbar table={scheduledTable}>
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
