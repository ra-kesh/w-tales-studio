"use client";

import { useQuery } from "@tanstack/react-query";

export const useExpenses = () => {
	return useQuery({
		queryKey: ["expenses"],
		queryFn: async () => {
			const response = await fetch("/api/expenses");
			if (!response.ok) {
				throw new Error("Failed to fetch expenses");
			}
			return response.json();
		},
	});
};

export const useExpense = (expenseId: string) => {
	return useQuery({
		queryKey: ["expenses", { expenseId }],
		queryFn: async () => {
			if (!expenseId) return null;
			const response = await fetch(`/api/expenses/${expenseId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch expense");
			}
			return response.json();
		},
		enabled: Boolean(expenseId),
	});
};
