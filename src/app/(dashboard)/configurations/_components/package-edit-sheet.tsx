"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackageParams } from "@/hooks/use-package-params";
import { PackageForm } from "./package-form";
import {
	usePackageDetail,
	useUpdatePackageMutation,
} from "@/hooks/use-configs";
import type { PackageFormValues } from "./package-form-schema";
import { toast } from "sonner";

export function PackageEditSheet() {
	const { setParams, packageId } = usePackageParams();
	const isOpen = Boolean(packageId);

	const { data: packageData, isLoading } = usePackageDetail(packageId ?? "");
	const updatePackageMutation = useUpdatePackageMutation();

	const handleSubmit = async (data: PackageFormValues) => {
		try {
			await updatePackageMutation.mutateAsync({
				data: {
					value: data.value,
					metadata: data.metadata,
				},
				packageId: packageId as string,
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

	const cleanedDefaultValues = packageData
		? {
				key: packageData.key,
				value: packageData.value,
				metadata: {
					defaultCost: packageData.metadata.defaultCost ?? "",
					defaultDeliverables:
						packageData.metadata.defaultDeliverables?.map((d) => ({
							title: d.title,
							quantity: d.quantity.toString(),
						})) ?? [],
				},
			}
		: undefined;

	return (
		<Sheet open={isOpen} onOpenChange={() => setParams(null)}>
			<SheetContent side="right" className="min-w-xl">
				<SheetHeader className="mb-6 flex justify-between items-center flex-row">
					<SheetTitle className="text-xl">Edit Package</SheetTitle>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setParams(null)}
						className="p-0 m-0 size-auto hover:bg-transparent"
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<PackageForm
						defaultValues={cleanedDefaultValues}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
