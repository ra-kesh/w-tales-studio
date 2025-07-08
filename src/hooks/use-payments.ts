"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type {
	PaymentSchedulesResponse,
	ReceivedPaymentDetail,
	ReceivedPaymentsResponse,
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
		queryKey: ["received-payments", "list", searchParams.toString()],
		queryFn: () => fetchReceivedPayments(searchParams),
	});
}

export function useReceivedPaymentDetail(paymentId: string) {
	return useQuery<ReceivedPaymentDetail, Error>({
		// The query key is an array that uniquely identifies this data.
		queryKey: ["received-payment", paymentId],
		queryFn: async () => {
			if (!paymentId) {
				throw new Error("Payment ID is required to fetch details.");
			}
			const response = await fetch(`/api/received-payments/${paymentId}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to fetch payment details.",
				);
			}
			return response.json();
		},
		enabled: !!paymentId,
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
	});
}
