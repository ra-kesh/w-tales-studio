import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShootFormValues } from "@/app/(dashboard)/shoots/_components/shoot-form-schema";
import { toast } from "sonner";

export function useCreateShootMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShootFormValues) => {
      const response = await fetch("/api/shoots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create shoot");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      queryClient.invalidateQueries({ queryKey: ["shoots"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Shoot created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create shoot");
    },
  });
}
