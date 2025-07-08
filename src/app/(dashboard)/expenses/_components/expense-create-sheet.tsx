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
import { useCreateExpenseMutation } from "@/hooks/use-expense-mutation";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { ExpenseFormValues } from "../expense-form-schema";
import { ExpenseForm } from "./expense-form";

export function ExpenseCreateSheet() {
	const { setParams, createExpense } = useExpenseParams();
	const { canCreateAndUpdateExpense } = usePermissions();

	const isOpen = Boolean(createExpense) && canCreateAndUpdateExpense;

	const createExpenseMutation = useCreateExpenseMutation();

	const handleSubmit = async (data: ExpenseFormValues) => {
		try {
			await createExpenseMutation.mutateAsync(data);
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
