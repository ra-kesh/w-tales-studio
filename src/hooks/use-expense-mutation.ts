"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({ queryKey: ["expenses", "stats"] });
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			toast.success("Expense created");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create expense");
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
			queryClient.invalidateQueries({ queryKey: ["expenses", "stats"] });
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			toast.success("Expense updated");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update expense");
		},
	});
};