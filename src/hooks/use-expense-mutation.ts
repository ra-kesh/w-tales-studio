"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExpenseFormValues } from "@/app/(dashboard)/expenses/expense-form-schema";

export const useCreateExpenseMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ExpenseFormValues) => {
			const response = await fetch("/api/expenses", {
				method: "POST",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create expense");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
		},
	});
};

export const useUpdateExpenseMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			data,
			expenseId,
		}: {
			data: ExpenseFormValues;
			expenseId: string;
		}) => {
			const response = await fetch(`/api/expenses/${expenseId}`, {
				method: "PUT",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update expense");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
		},
	});
};
