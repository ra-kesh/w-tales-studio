"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type {
	ReceivedPaymentsResponse,
	PaymentSchedulesResponse,
} from "@/types/payments";


export async function fetchReceivedPayments(
	searchParams: URLSearchParams,
): Promise<ReceivedPaymentsResponse> {
	const response = await fetch(
		`/api/received-payments?${searchParams.toString()}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch received payments");
	}

	return response.json();
}


export function useReceivedPayments() {
	const searchParams = useSearchParams();

	return useQuery<ReceivedPaymentsResponse, Error>({
		// The query key is dynamic, ensuring refetches when filters change
		queryKey: ["received-payments", "list", searchParams.toString()],
		queryFn: () => fetchReceivedPayments(searchParams),
		placeholderData: { data: [], total: 0, pageCount: 0 },
	});
}

export async function fetchPaymentSchedules(
	searchParams: URLSearchParams,
): Promise<PaymentSchedulesResponse> {
	const response = await fetch(
		`/api/payment-schedules?${searchParams.toString()}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch payment schedules");
	}

	return response.json();
}


export function usePaymentSchedules() {
	const searchParams = useSearchParams();

	return useQuery<PaymentSchedulesResponse, Error>({
		queryKey: ["payment-schedules", "list", searchParams.toString()],
		queryFn: () => fetchPaymentSchedules(searchParams),
		placeholderData: { data: [], total: 0, pageCount: 0 },
	});
}
