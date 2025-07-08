"use client";

import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { Expense } from "@/lib/db/schema";

type Expenserow = Expense & { booking: { name: string } };

interface ExpenseTableRowActionsProps<TData> {
	row: Row<Expenserow>;
}

export function ExpenseTableRowActions<TData>({
	row,
}: ExpenseTableRowActionsProps<TData>) {
	const { setParams } = useExpenseParams();

	const { canCreateAndUpdateExpense } = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{canCreateAndUpdateExpense && (
					<DropdownMenuItem
						onClick={() => setParams({ expenseId: row.original.id.toString() })}
					>
						Edit expense
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete expense
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
