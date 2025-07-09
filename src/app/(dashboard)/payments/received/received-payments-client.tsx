"use client";

import * as React from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useReceivedPayments } from "@/hooks/use-payments";
import { OpenRecviedPaymentSheet } from "../_component/open-received-payments-sheet";
import { PaymentsTable } from "../_component/payment-table";
import { useReceivedPaymentsColumns } from "../_component/received-payments-columns";

export function ReceivedPaymentsClientPage() {
	const { data, isPending } = useReceivedPayments();
	const { data: minimalBookingsResponse, isLoading: isMininmalBookingLoading } =
		useMinimalBookings();
	const minimalBookings = minimalBookingsResponse?.data;

	const columns = useReceivedPaymentsColumns({
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
				<OpenRecviedPaymentSheet />
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
