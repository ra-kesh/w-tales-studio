"use client";

import { useClients } from "@/hooks/use-clients";
import { useClientColumns } from "./_components/client-table-columns";
import { ClientTable } from "./_components/client-table";
import React from "react";

export function Clients() {
	const { data } = useClients();
	const columns = useClientColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<ClientTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
