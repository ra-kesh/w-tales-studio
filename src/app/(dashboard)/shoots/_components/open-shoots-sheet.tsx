"use client";

import { Button } from "@/components/ui/button";
import { useShootsParams } from "@/hooks/use-shoots-params";

export function OpenShootsSheet() {
	const { setParams } = useShootsParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createShoot: true })}
			>
				Add Shoot
			</Button>
		</div>
	);
}
