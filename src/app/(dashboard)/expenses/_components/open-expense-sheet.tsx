"use client";

import { Button } from "@/components/ui/button";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenExpenseSheet() {
	const { setParams } = useExpenseParams();

	const { canCreateAndUpdateExpense } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createExpense: true })}
				disabled={!canCreateAndUpdateExpense}
			>
				Add Expense
			</Button>
		</div>
	);
}
