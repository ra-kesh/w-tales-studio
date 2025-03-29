import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/lib/db/schema";

interface BookingResponse {
  data: Booking[];
  total: number;
}

export async function fetchBookings(): Promise<BookingResponse> {
  const response = await fetch("/api/bookings", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    placeholderData: { data: [], total: 0 },
  });
}
