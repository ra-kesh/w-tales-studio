"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useExpenses = () => {
	const searchParams = useSearchParams();

	return useQuery({
		queryKey: ["expenses", searchParams.toString()],
		queryFn: async () => {
			const response = await fetch(`/api/expenses?${searchParams.toString()}`);
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
