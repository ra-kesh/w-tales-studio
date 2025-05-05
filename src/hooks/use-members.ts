import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Define the expected shape of a member returned by the API
export interface OrganizationMember {
  memberId: string; // Assuming member ID is string based on schema
  userId: string;
  role: string | null;
  joinedAt: string; // Assuming date is stringified
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
}

async function fetchOrganizationMembers(): Promise<OrganizationMember[]> {
  const response = await fetch("/api/members");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
    const errorMessage = errorData?.error || `Failed to fetch members: ${response.statusText}`;
    console.error("Error fetching members:", errorMessage);
    toast.error(errorMessage); // Show error to user
    throw new Error(errorMessage);
  }

  return response.json();
}

export function useOrganizationMembers() {
  return useQuery<OrganizationMember[], Error>({
    queryKey: ["organizationMembers"], // Unique key for this query
    queryFn: fetchOrganizationMembers,
    // Optional: Add staleTime or cacheTime if needed
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
}