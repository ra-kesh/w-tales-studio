import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCrewMutation, useUpdateCrewMutation } from "./use-crews";
import type { Crew } from "@/lib/db/schema";

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
					...crew,
					equipment: crew.equipment?.join(", "),
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
