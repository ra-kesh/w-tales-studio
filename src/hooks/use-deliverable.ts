import { useQuery } from "@tanstack/react-query";

async function fetchDeliverable(id: string) {
	const response = await fetch(`/api/deliverables/${id}`);
	if (!response.ok) {
		throw new Error("Failed to fetch deliverable");
	}
	return response.json();
}

export function useDeliverable(id: string | null) {
	return useQuery({
		queryKey: ["deliverable", id],
		queryFn: () => fetchDeliverable(id as string),
		enabled: Boolean(id),
	});
}
