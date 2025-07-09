"use client";

import * as React from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { usePaymentSchedules, useReceivedPayments } from "@/hooks/use-payments";
import { OpenRecviedPaymentSheet } from "../_component/open-received-payments-sheet";
import { OpenScheduledPaymentSheet } from "../_component/open-scheduled-payment-sheet";
import { PaymentsTable } from "../_component/payment-table";
import { useScheduledPaymentsColumns } from "../_component/scheduled-payments-columns";

export function ScheduledPaymentsClientPage() {
	const { data, isPending } = usePaymentSchedules();

	const { data: minimalBookingsResponse, isLoading: isMininmalBookingLoading } =
		useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const columns = useScheduledPaymentsColumns({
		minimalBookings: minimalBookings ?? [],
		isMininmalBookingLoading,
	});
	const { table } = useBookingTable({
		data: data?.data ?? [],
		columns,
		pageCount: data?.pageCount ?? 0,
	});

	return (
		<div className="mt-4">
			<DataTableToolbar table={table} className="mb-2">
				<OpenScheduledPaymentSheet />
			</DataTableToolbar>
			{isPending ? (
				<DataTableSkeleton columnCount={5} />
			) : (
				<PaymentsTable table={table} columns={columns}>
					<DataTablePagination table={table} />
				</PaymentsTable>
			)}
		</div>
	);
}
