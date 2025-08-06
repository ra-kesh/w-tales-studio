import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ShootFormValues } from "@/app/(dashboard)/shoots/_components/shoot-form-schema";

export function useCreateShootMutation() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: ShootFormValues) => {
			const response = await fetch("/api/shoots", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message || "Failed to create shoot");
			}

			return responseData;
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({
				queryKey: ["shoots", "stats"],
			});
			queryClient.invalidateQueries({
				queryKey: ["bookings", "shoot", "list"],
			});
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"shoot",
					"detail",
					{
						shootId: data.shootId.toString(),
					},
				],
			});
			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			toast.success("Shoot created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create shoot");
		},
		onSettled: () => {
			router.refresh();
		},
	});
}

export function useUpdateShootMutation() {
	const queryClient = useQueryClient();

	const router = useRouter();

	return useMutation({
		mutationFn: async ({
			data,
			shootId,
		}: {
			data: ShootFormValues;
			shootId: string;
		}) => {
			const response = await fetch(`/api/shoots/${shootId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message || "Failed to update shoot");
			}

			return responseData;
		},
		onSuccess: ({ data }) => {
			queryClient.invalidateQueries({
				queryKey: ["shoots", "stats"],
			});
			queryClient.invalidateQueries({
				queryKey: ["bookings", "shoot", "list"],
			});
			queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });

			queryClient.invalidateQueries({
				queryKey: [
					"bookings",
					"shoot",
					"detail",
					{
						shootId: data.shootId.toString(),
					},
				],
			});
			// to make sure boooking detail always have fresh data
			queryClient.refetchQueries({
				queryKey: [
					"bookings",
					"detail",
					{
						bookingId: data.bookingId.toString(),
					},
				],
			});
			toast.success("Shoot updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update shoot");
		},
		onSettled: () => {
			router.refresh();
		},
	});
}
