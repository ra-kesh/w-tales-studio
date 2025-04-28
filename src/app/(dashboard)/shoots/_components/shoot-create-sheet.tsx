"use client";

import React from "react";
import { useShootsParams } from "@/hooks/use-shoots-params";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ShootForm } from "./shoot-form";
import type { ShootFormValues } from "./shoot-form-schema";
import { useCreateShootMutation } from "@/hooks/use-shoot-mutation";

export function ShootCreateSheet() {
	const { setParams, createShoot } = useShootsParams();
	const isOpen = Boolean(createShoot);

	const createShootMutation = useCreateShootMutation();

	const handleSubmit = async (data: ShootFormValues) => {
		try {
			await createShootMutation.mutateAsync(data);
			setParams(null);
		} catch (error) {
			console.error(error);
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
