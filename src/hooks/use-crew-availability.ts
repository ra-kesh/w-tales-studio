import { useQuery } from "@tanstack/react-query";

async function fetchCrewAvailability(date: string) {
	const response = await fetch(`/api/crews/availability?date=${date}`);
	if (!response.ok) {
		throw new Error("Failed to fetch crew availability");
	}
	return response.json();
}

export function useCrewAvailability(date: string | null) {
	return useQuery({
		queryKey: ["crew-availability", date],
		queryFn: () => fetchCrewAvailability(date!),
		enabled: !!date,
	});
}
