import type { Expense } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

interface ExpensesResponse {
	data: Expense[];
	total: number;
	page: number;
	limit: number;
}

export async function fetchExpenses(): Promise<ExpensesResponse> {
	const response = await fetch("/api/expenses");
	if (!response.ok) {
		throw new Error("Failed to fetch expenses");
	}
	return response.json();
}

export function useExpenses() {
	return useQuery({
		queryKey: ["expenses"],
		queryFn: fetchExpenses,
	});
}
