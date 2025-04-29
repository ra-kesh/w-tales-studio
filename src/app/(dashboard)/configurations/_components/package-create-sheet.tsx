"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePackageParams } from "@/hooks/use-package-params";
import { PackageForm } from "./package-form";
import { useCreatePackageMutation } from "@/hooks/use-configs";
import type { PackageFormValues } from "./package-form-schema";
import { toast } from "sonner";

export function PackageCreateSheet() {
	const { setParams, createPackage } = usePackageParams();
	const isOpen = Boolean(createPackage);

	const createPackageMutation = useCreatePackageMutation();

	const handleSubmit = async (data: PackageFormValues) => {
		try {
			await createPackageMutation.mutateAsync({
				value: data.value,
				metadata: data.metadata,
			});
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
					<SheetTitle className="text-xl">Create Package</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>

				<PackageForm onSubmit={handleSubmit} mode="create" />
			</SheetContent>
		</Sheet>
	);
}
