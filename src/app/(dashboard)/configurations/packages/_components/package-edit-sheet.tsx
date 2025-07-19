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
import {
	usePackageDetail,
	useUpdatePackageMutation,
} from "@/hooks/use-configs";
import { usePackageParams } from "@/hooks/use-package-params";
import { usePermissions } from "@/hooks/use-permissions";
import { PackageForm } from "./package-form";
import type { PackageFormValues, PackageMetadata } from "./package-form-schema";

export function PackageEditSheet() {
	const { setParams, packageId } = usePackageParams();
	const isOpen = Boolean(packageId);

	const { canCreateAndUpdatePackageTypes } = usePermissions();

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

	const cleanedDefaultValues = React.useMemo(() => {
		if (!packageData) return undefined;

		const metadataFromApi = (packageData.metadata || {}) as PackageMetadata;

		return {
			value: packageData.value,
			metadata: {
				defaultCost: metadataFromApi.defaultCost ?? "",
				defaultDeliverables:
					metadataFromApi.defaultDeliverables?.map((d) => ({
						title: d.title ?? "",
						quantity: d.quantity ?? "",
					})) ?? [],
				bookingType: metadataFromApi.bookingType ?? "",
			},
		};
	}, [packageData]);

	if (!canCreateAndUpdatePackageTypes) {
		return null;
	}
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
