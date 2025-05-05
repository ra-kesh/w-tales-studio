"use client";

import { useCrews } from "@/hooks/use-crews";
import React from "react";
import { CrewTable } from "./_components/crew-table";
import { useCrewColumns } from "./_components/crew-table-columns";

export function Crews() {
	const { data } = useCrews();
	const columns = useCrewColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<CrewTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
