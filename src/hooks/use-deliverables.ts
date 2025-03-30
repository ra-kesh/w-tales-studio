import { useQuery } from "@tanstack/react-query";
import type { Deliverable } from "@/lib/db/schema";

interface DeliverablesResponse {
  data: Deliverable[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchDeliverables(): Promise<DeliverablesResponse> {
  const response = await fetch("/api/deliverables");
  if (!response.ok) {
    throw new Error("Failed to fetch deliverables");
  }
  return response.json();
}

export function useDeliverables() {
  return useQuery({
    queryKey: ["deliverables"],
    queryFn: fetchDeliverables,
  });
}
