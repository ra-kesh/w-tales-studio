"use client";

import { Button } from "@/components/ui/button";
import { useExpenseParams } from "@/hooks/use-expense-params";

export function OpenExpenseSheet() {
	const { setParams } = useExpenseParams();

	return (
		<div>
			<Button onClick={() => setParams({ createExpense: true })}>
				Add Expense
			</Button>
		</div>
	);
}
