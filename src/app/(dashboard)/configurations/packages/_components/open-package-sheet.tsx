"use client";

import { Button } from "@/components/ui/button";
import { usePackageParams } from "@/hooks/use-package-params";

export function OpenPackageSheet() {
	const { setParams } = usePackageParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createPackage: true })}
			>
				Add Package
			</Button>
		</div>
	);
}
