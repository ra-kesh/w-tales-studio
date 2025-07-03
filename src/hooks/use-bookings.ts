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
	const { data: booking, isLoading, error } = useBookingDetail(bookingId);

	// Only re‐compute when booking changes
	const data = useMemo<BookingFormValues | undefined>(
		() => (booking ? transformBookingToFormData(booking) : undefined),
		[booking],
	);

	return { data, isLoading, error };
}

export function transformBookingToFormData(
	booking: BookingDetail,
): BookingFormValues {
	const participants: Participant[] = booking.participants.map((pp) => ({
		name: pp.client.name,
		role: pp.role,
		phone: pp.client.phoneNumber ?? "",
		email: pp.client.email ?? "",
		address: pp.client.address ?? "",
		metadata: pp.client.metadata ?? {},
	}));

	return {
		bookingName: booking.name,
		bookingType: booking.bookingTypeKey, // the raw key
		packageType: booking.packageTypeKey, // the raw key
		packageCost: booking.packageCost,

		// new participants array
		participants,

		note: booking.note ?? "",

		shoots: booking.shoots.map((s) => ({
			title: s.title ?? "",
			date: s.date ?? "",
			time: s.time ?? "",
			location:
				typeof s.location === "string"
					? s.location
					: JSON.stringify(s.location),
			crews: s.shootsAssignments?.map((a) => a.crew.id.toString()) ?? [],
		})),

		deliverables: booking.deliverables.map((d) => ({
			title: d.title ?? "",
			cost: d.cost ?? "0.00",
			quantity: d.quantity.toString(),
			dueDate: d.dueDate ?? "",
		})),

		payments: booking.receivedAmounts.map((r) => ({
			amount: r.amount,
			description: r.description ?? "",
			date: r.paidOn ?? "",
		})),

		scheduledPayments: booking.paymentSchedules.map((p) => ({
			amount: p.amount,
			description: p.description ?? "",
			dueDate: p.dueDate ?? "",
		})),
	};
}
