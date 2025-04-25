import { useQuery } from "@tanstack/react-query";
import type { Booking, BookingDetail } from "@/lib/db/schema";
import type { BookingFormValues } from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";

interface BookingResponse {
  data: Booking[];
  total: number;
}
interface MinimalBookingResponse {
  data: Pick<Booking, "id" | "name">[];
  total: number;
}

export async function fetchBookings(
  page = 1,
  limit = 10
): Promise<BookingResponse> {
  const response = await fetch(`/api/bookings?page=${page}&limit=${limit}`, {
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

export function useBookings(page?: number, limit?: number) {
  return useQuery({
    queryKey: ["bookings", page, limit],
    queryFn: () => fetchBookings(page, limit),
    placeholderData: { data: [], total: 0 },
  });
}

export function useMinimalBookings() {
  return useQuery({
    queryKey: ["bookings-minimal"],
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
    queryKey: ["booking-detail", id],
    queryFn: () => fetchBookingDetail(id),
    enabled: !!id,
  });
}

export function useBookingFormData(bookingId: string) {
  const { data: booking, isLoading, error } = useBookingDetail(bookingId);

  const formattedData = booking
    ? transformBookingToFormData(booking)
    : undefined;

  return {
    data: formattedData,
    isLoading,
    error,
  };
}

export function transformBookingToFormData(
  booking: BookingDetail
): BookingFormValues {
  return {
    bookingName: booking.name,
    bookingType: booking.bookingType,
    packageType: booking.packageType,
    packageCost: booking.packageCost,
    clientName: booking.clients.name,
    brideName: booking.clients.brideName,
    groomName: booking.clients.groomName,
    relation: booking.clients.relation, // assuming relation matches the schema
    phone: booking.clients.phoneNumber,
    email: booking.clients.email as string,
    address: booking.clients.address,
    note: booking.note ?? "",

    shoots: booking.shoots.map((shoot) => ({
      title: shoot.title ?? "",
      date: shoot.date ?? "",
      time: shoot.time ?? "",
      location: (shoot.location as string) ?? "",
    })),

    deliverables: booking.deliverables.map((item) => ({
      title: item.title ?? "",
      cost: item.cost || "0.00",
      quantity: item.quantity.toString() ?? "",
      dueDate: (item.dueDate as string) ?? "",
    })),

    payments: booking.receivedAmounts.map((payment) => ({
      amount: payment.amount,
      description: (payment.description as string) ?? "",
      date: (payment.paidOn as string) ?? "",
    })),

    scheduledPayments: booking.paymentSchedules.map((schedule) => ({
      amount: schedule.amount ?? "",
      description: (schedule.description as string) ?? "",
      dueDate: (schedule.dueDate as string) ?? "",
    })),
  };
}
