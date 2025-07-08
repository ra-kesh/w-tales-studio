"use client";

import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCrewParams } from "@/hooks/use-crew-params";
import { useCreateCrewMutation } from "@/hooks/use-crews";
import { usePermissions } from "@/hooks/use-permissions";
import { CrewForm } from "./crew-form";
import type { CrewFormValues } from "./crew-form-schema";

export function CrewCreateSheet() {
	const { setParams, createCrew } = useCrewParams();
	const { canCreateAndUpdateCrew } = usePermissions();

	const isOpen = Boolean(createCrew) && canCreateAndUpdateCrew;

	const createCrewMutation = useCreateCrewMutation();

	const handleSubmit = async (data: CrewFormValues) => {
		try {
			await createCrewMutation.mutateAsync(data);
			setParams(null);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Crew Member</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<CrewForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
