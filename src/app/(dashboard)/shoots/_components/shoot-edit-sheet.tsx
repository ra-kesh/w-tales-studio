"use client";

import React from "react";
import { useShootsParams } from "@/hooks/use-shoots-params";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShootDetail } from "@/hooks/use-shoots";
import { ShootForm } from "./shoot-form";
import { useUpdateShootMutation } from "@/hooks/use-shoot-mutation";
import type { ShootFormValues } from "./shoot-form-schema";
import { toast } from "sonner";

export function ShootEditSheet() {
	const { setParams, shootId } = useShootsParams();
	const updateShootMutation = useUpdateShootMutation();

	const { data: shoot, refetch, isLoading } = useShootDetail(shootId as string);

	const isOpen = Boolean(shootId);

	const handleSubmit = async (data: ShootFormValues) => {
		try {
			await updateShootMutation.mutateAsync({
				data,
				shootId: shootId as string,
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
					<SheetTitle className="text-xl">Edit Shoot</SheetTitle>
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
					<div>Loading..</div>
				) : (
					shoot && (
						<ShootForm
							defaultValues={shoot}
							onSubmit={handleSubmit}
							mode="edit"
						/>
					)
				)}
			</SheetContent>
		</Sheet>
	);
}
