"use client";

import React from "react";
import { useCrewParams } from "@/hooks/use-crew-params";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrewDetail, useUpdateCrewMutation } from "@/hooks/use-crews";
import { CrewForm } from "./crew-form";
import type { CrewFormValues } from "./crew-form-schema";
import { toast } from "sonner";

export function CrewEditSheet() {
	const { setParams, crewId } = useCrewParams();
	const updateCrewMutation = useUpdateCrewMutation();

	const { data: crew, refetch, isLoading } = useCrewDetail(crewId as string);

	const isOpen = Boolean(crewId);

	const handleSubmit = async (data: CrewFormValues) => {
		try {
			await updateCrewMutation.mutateAsync({
				...data,
				id: Number.parseInt(crewId as string, 10),
			});
			refetch();
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
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Crew Member</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<XIcon className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					crew && (
						<CrewForm
							defaultValues={crew}
							onSubmit={handleSubmit}
							mode="edit"
						/>
					)
				)}
			</SheetContent>
		</Sheet>
	);
}
