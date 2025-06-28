"use client";

import { useClients } from "@/hooks/use-clients";
import { useClientColumns } from "./_components/client-table-columns";
import { ClientTable } from "./_components/client-table";
import React from "react";
import { useBookingTable } from "@/hooks/use-booking-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ClientTablePagination } from "./_components/client-table-pagination";
import type { ClientBookingRow } from "@/lib/db/queries";

export default function Clients() {
	const { data, isLoading } = useClients();

	const columns = useClientColumns();
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
			{isLoading ? (
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
