"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { useExpenseColumns } from "./_components/expense-table-columns";
import { ExpenseTable } from "./_components/expense-table";
import React from "react";

export function Expenses() {
	const { data } = useExpenses();
	const columns = useExpenseColumns();
	const defaultData = React.useMemo(() => [], []);

	return (
		<div className="flex-1 min-w-0">
			<ExpenseTable data={data?.data || defaultData} columns={columns} />
		</div>
	);
}
