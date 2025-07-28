import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type {
	BookingFormValues,
	Participant,
} from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import type { BookingStats } from "@/lib/db/queries";
import type { Booking, Shoot } from "@/lib/db/schema";
import type { BookingDetail } from "@/types/booking";

interface BookingResponse {
	data: (Booking & { shoots: Shoot[]; participants: Participant[] })[];
	total: number;
	pageCount: number;
	stats: BookingStats;
}
interface MinimalBookingResponse {
	data: Pick<Booking, "id" | "name">[];
	total: number;
}

export async function fetchBookings(
	searchParams: URLSearchParams,
): Promise<BookingResponse> {
	const response = await fetch(`/api/bookings?${searchParams}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch bookings");
	}

	return response.json();
}

export async function fetchMinimalBookings(): Promise<MinimalBookingResponse> {
	const response = await fetch("/api/bookings/minimal?fields=id,name", {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch minimal bookings");
	}

	return response.json();
}

export function useBookings() {
	const searchParams = useSearchParams();
	return useQuery<BookingResponse, Error>({
		queryKey: ["bookings", "list", searchParams.toString()],
		queryFn: () => fetchBookings(searchParams),
	});
}

export function useMinimalBookings() {
	return useQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: fetchMinimalBookings,
		placeholderData: { data: [], total: 0 },
	});
}

async function fetchBookingDetail(id: string): Promise<BookingDetail> {
	const response = await fetch(`/api/bookings/${id}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch booking details: ${response.statusText}`);
	}

	return response.json();
}

export function useBookingDetail(id: string) {
	return useQuery({
		queryKey: [
			"bookings",
			"detail",
			{
				bookingId: id,
			},
		],
		queryFn: () => fetchBookingDetail(id),
		enabled: !!id,
	});
}

export function useBookingFormData(bookingId: string) {
	const {
		data: booking,
		refetch,
		isLoading,
		error,
	} = useBookingDetail(bookingId);

	const data = useMemo(
		() => (booking ? transformBookingToFormData(booking) : undefined),
		[booking],
	);

	return { data, refetch, isLoading, error };
}

export function transformBookingToFormData(booking: BookingDetail) {
	return {
		bookingName: booking.name,
		bookingType: booking.bookingTypeKey,
		packageType: booking.packageTypeKey,
		packageCost: booking.packageCost,
		note: booking.note,
		status: booking.status,
	};
}
