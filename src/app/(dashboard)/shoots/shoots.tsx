"use client";

import { useShootColumns } from "./_components/shoots-table-columns";
import React from "react";
import { ShootTable } from "./_components/shoots-table";
import { useShoots } from "@/hooks/use-shoots";

export function Shoots() {
	const { data } = useShoots();

	const columns = useShootColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<ShootTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
