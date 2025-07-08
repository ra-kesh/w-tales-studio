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
import { usePermissions } from "@/hooks/use-permissions";
import { useCreateShootMutation } from "@/hooks/use-shoot-mutation";
import { useShootsParams } from "@/hooks/use-shoots-params";
import { ShootForm } from "./shoot-form";
import type { ShootFormValues } from "./shoot-form-schema";

export function ShootCreateSheet() {
	const { setParams, createShoot } = useShootsParams();
	const { canCreateAndUpdateShoot } = usePermissions();

	const isOpen = Boolean(createShoot) && canCreateAndUpdateShoot;

	const createShootMutation = useCreateShootMutation();

	const handleSubmit = async (data: ShootFormValues) => {
		try {
			await createShootMutation.mutateAsync(data);
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
				<SheetHeader className=" flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Create Shoot</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<ShootForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
