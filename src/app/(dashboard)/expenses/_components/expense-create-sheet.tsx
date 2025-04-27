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
import type { ExpenseFormValues } from "../expense-form-schema";
import { useCreateExpenseMutation } from "@/hooks/use-expense-mutation";

export function ExpenseCreateSheet() {
	const { setParams, createExpense } = useExpenseParams();
	const isOpen = Boolean(createExpense);

	const createExpenseMutation = useCreateExpenseMutation();

	const handleSubmit = async (data: ExpenseFormValues) => {
		try {
			await createExpenseMutation.mutate(data);
			setParams(null);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Expense</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<ExpenseForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
