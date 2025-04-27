"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { ExpenseForm } from "./expense-form";
import { useUpdateExpenseMutation } from "@/hooks/use-expense-mutation";
import type { ExpenseFormValues } from "../expense-form-schema";
import { useExpense } from "@/hooks/use-expenses";

export function ExpenseEditSheet() {
	const { setParams, expenseId } = useExpenseParams();
	const isOpen = Boolean(expenseId);

	const { data: expense, isLoading, refetch } = useExpense(expenseId as string);
	const updateExpenseMutation = useUpdateExpenseMutation();

	const handleSubmit = async (data: ExpenseFormValues) => {
		try {
			await updateExpenseMutation.mutate({
				data,
				expenseId: expenseId as string,
			});
			refetch();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Expense</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ExpenseForm
						defaultValues={expense}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
