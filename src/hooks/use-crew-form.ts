import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod/v4";
import type { Crew } from "@/lib/db/schema";
import { useCreateCrewMutation, useUpdateCrewMutation } from "./use-crews";

const crewFormSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	role: z.string().min(1, {
		message: "Please select a role.",
	}),
	specialization: z.string().min(1, {
		message: "Please enter a specialization.",
	}),
	phoneNumber: z.string().optional(),
	equipment: z.string().optional(),
	status: z.string().min(1, {
		message: "Please select a status.",
	}),
});

export type CrewFormValues = z.infer<typeof crewFormSchema>;

const defaultValues: Partial<CrewFormValues> = {
	name: "",
	email: "",
	role: "",
	specialization: "",
	phoneNumber: "",
	equipment: "",
	status: "available",
};

interface UseCrewFormProps {
	crew?: Crew;
	onSuccess?: () => void;
}

export function useCrewForm({ crew, onSuccess }: UseCrewFormProps = {}) {
	const createCrew = useCreateCrewMutation();
	const updateCrew = useUpdateCrewMutation();

	const form = useForm<CrewFormValues>({
		resolver: zodResolver(crewFormSchema),
		defaultValues: crew
			? {
					name: crew.name ?? "",
					email: crew.email ?? "",
					role: crew.role ?? "",
					specialization: crew.specialization ?? "",
					phoneNumber: crew.phoneNumber ?? "",
					equipment: crew.equipment ? crew.equipment.join(", ") : "",
					status: crew.status ?? "available",
				}
			: defaultValues,
	});

	const onSubmit = async (values: CrewFormValues) => {
		const equipmentArray = values.equipment
			? values.equipment.split(",").map((item) => item.trim())
			: [];

		if (crew) {
			await updateCrew.mutateAsync({
				id: crew.id,
				...values,
				equipment: equipmentArray,
			});
		} else {
			await createCrew.mutateAsync({
				...values,
				equipment: equipmentArray,
			});
		}

		onSuccess?.();
	};

	return {
		form,
		onSubmit,
		isPending: createCrew.isPending || updateCrew.isPending,
	};
}
