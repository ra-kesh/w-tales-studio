"use client";

import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useBookingTable } from "@/hooks/use-booking-table";
import { useMinimalBookings } from "@/hooks/use-bookings";
import { useClients } from "@/hooks/use-clients";
import { usePackageTypes } from "@/hooks/use-configs";
import type { ClientBookingRow } from "@/lib/db/queries";
import { ClientTable } from "./_components/client-table";
import { useClientColumns } from "./_components/client-table-columns";
import { ClientTablePagination } from "./_components/client-table-pagination";

export default function Clients() {
	const { data, isPending } = useClients();

	const { data: packageTypes, isPending: isPackageTypesLoading } =
		usePackageTypes();

	const {
		data: minimalBookingsResponse,
		isLoading: isMininmalBookingLoading,
		isFetched: isMinimalBookingFetched,
	} = useMinimalBookings();

	const minimalBookings = minimalBookingsResponse?.data;

	const columns = useClientColumns({
		packageTypes,
		isPackageTypesLoading,
		minimalBookings: minimalBookings ?? [],
		isMininmalBookingLoading,
	});
	const defaultData = React.useMemo<ClientBookingRow[]>(() => [], []);

	const { table } = useBookingTable<ClientBookingRow>({
		data: data?.data ?? defaultData,
		pageCount: data?.pageCount ?? 0,
		columns,
		initialState: {
			// sorting: [{ id: "createdAt", desc: true }],
			columnPinning: { right: ["actions"] },
		},
		getRowId: (originalRow) => originalRow.id.toString(),
		shallow: false,
		clearOnDefault: true,
	});

	return (
		<div className="flex-1 min-w-0 py-6">
			<DataTableToolbar table={table} className="my-2" />
			{isPending ? (
				<DataTableSkeleton
					columnCount={7}
					filterCount={0}
					cellWidths={["20rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
					shrinkZero
				/>
			) : (
				<>
					<ClientTable table={table} columns={columns}>
						<ClientTablePagination table={table} />
					</ClientTable>
				</>
			)}
		</div>
	);
}
