"use client";

import { Button } from "@/components/ui/button";
import { usePackageParams } from "@/hooks/use-package-params";

export function OpenPackageSheet() {
	const { setParams } = usePackageParams();

	return (
		<div>
			<Button onClick={() => setParams({ createPackage: true })}>
				Add Package
			</Button>
		</div>
	);
}
