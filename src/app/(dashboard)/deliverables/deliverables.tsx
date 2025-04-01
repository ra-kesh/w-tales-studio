"use client";

import { useDeliverables } from "@/hooks/use-deliverables";
import { useDeliverableColumns } from "./_components/deliverable-table-columns";
import { DeliverableTable } from "./_components/deliverable-table";
import React from "react";

export function Deliverables() {
	const { data, isLoading, isError } = useDeliverables();
	const columns = useDeliverableColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<DeliverableTable
				data={data?.data || defaultData}
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				columns={columns as any}
			/>
		</div>
	);
}
