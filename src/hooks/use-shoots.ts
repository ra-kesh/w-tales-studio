import { useQuery } from "@tanstack/react-query";
import type { Shoot } from "@/lib/db/schema";

interface ShootsResponse {
  data: Shoot[];
  total: number;
}

export async function fetchShoots(): Promise<ShootsResponse> {
  const response = await fetch("/api/shoots", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shoots");
  }

  return response.json();
}

export function useShoots() {
  return useQuery({
    queryKey: ["shoots"],
    queryFn: fetchShoots,
    placeholderData: { data: [], total: 0 },
  });
}
