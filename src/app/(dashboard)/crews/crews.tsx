"use client";

import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useCrews } from "@/hooks/use-crews";
import { CrewTable } from "./_components/crew-table";
import { useCrewColumns } from "./_components/crew-table-columns";

export function Crews() {
	const { data, isPending } = useCrews();
	const columns = useCrewColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			{isPending ? (
				<DataTableSkeleton
					columnCount={4}
					filterCount={0}
					cellWidths={["20rem", "10rem", "10rem", "10rem"]}
					shrinkZero
				/>
			) : (
				<CrewTable data={data?.data || defaultData} columns={columns} />
			)}
		</div>
	);
}
