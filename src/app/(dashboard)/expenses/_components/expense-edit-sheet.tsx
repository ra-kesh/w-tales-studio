"use client";

import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateExpenseMutation } from "@/hooks/use-expense-mutation";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { useExpense } from "@/hooks/use-expenses";
import { usePermissions } from "@/hooks/use-permissions";
import type { ExpenseFormValues } from "../expense-form-schema";
import { ExpenseForm } from "./expense-form";

export function ExpenseEditSheet() {
	const { setParams, expenseId } = useExpenseParams();
	const { canCreateAndUpdateExpense } = usePermissions();

	const isOpen = Boolean(expenseId) && canCreateAndUpdateExpense;

	const { data: expense, isLoading } = useExpense(expenseId as string);
	const updateExpenseMutation = useUpdateExpenseMutation();

	const handleSubmit = async (data: ExpenseFormValues) => {
		try {
			await updateExpenseMutation.mutateAsync({
				data,
				expenseId: expenseId as string,
			});
			setParams(null);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
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
