"use client";

import React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackageParams } from "@/hooks/use-package-params";
import { PackageForm } from "./package-form";
import { usePackageDetail } from "@/hooks/use-configs";
import { defaultPackage } from "./package-form-schema";

export function PackageEditSheet() {
	const { setParams, packageId } = usePackageParams();
	const { data: packageData, isLoading } = usePackageDetail(packageId ?? "");

	const isOpen = Boolean(packageId);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const handleSubmit = async (data: any) => {
		// TODO: Implement update logic
		console.log(data);
		setParams(null);
	};

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
						<XIcon className="size-4" />
					</Button>
				</SheetHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<PackageForm
						defaultValues={
							packageData
								? {
										...packageData,
										metadata: {
											...packageData.metadata,
											defaultCost: packageData.metadata.defaultCost ?? "",
										},
									}
								: defaultPackage
						}
						onSubmit={handleSubmit}
						mode="edit"
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
