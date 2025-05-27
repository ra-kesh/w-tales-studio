import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export interface OnboardingStatus {
	onboarded: boolean;
	organizationCreated: boolean;
	packageCreated: boolean;
	bookingCreated: boolean;
	membersInvited: boolean;
}

async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
	const response = await fetch("/api/onboarding");

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMessage =
			errorData?.error ||
			`Failed to fetch onboarding status: ${response.statusText}`;
		console.error("Error fetching onboarding status:", errorMessage);
		toast.error(errorMessage);
		throw new Error(errorMessage);
	}

	return response.json();
}

export function useOnboarding() {
	return useQuery<OnboardingStatus, Error>({
		queryKey: ["onboarding"],
		queryFn: fetchOnboardingStatus,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

// export function useCreateOrganisationMutation(){
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: CreateOrganisationInput) => {
//       const response = await fetch("/api/organisations", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const errorMessage = errorData?.error || `Failed to create organisation: ${response.statusText}`;
//         console.error("Error creating organisation:", errorMessage);
//         toast.error(errorMessage);
//         throw new Error(errorMessage);
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["onboarding"]);
//     },
//   });
// }
