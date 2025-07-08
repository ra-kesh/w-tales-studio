"use client";

import { Button } from "@/components/ui/button";
import { usePackageParams } from "@/hooks/use-package-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenPackageSheet() {
	const { setParams } = usePackageParams();

	const { canCreateAndUpdatePackageTypes } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createPackage: true })}
				disabled={!canCreateAndUpdatePackageTypes}
			>
				Add Package
			</Button>
		</div>
	);
}
