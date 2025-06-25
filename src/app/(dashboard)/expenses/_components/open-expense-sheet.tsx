"use client";

import { Button } from "@/components/ui/button";
import { useExpenseParams } from "@/hooks/use-expense-params";

export function OpenExpenseSheet() {
	const { setParams } = useExpenseParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createExpense: true })}
			>
				Add Expense
			</Button>
		</div>
	);
}
