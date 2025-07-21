"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { useShootsParams } from "@/hooks/use-shoots-params";

export function OpenShootsSheet() {
	const { setParams } = useShootsParams();

	const { canCreateAndUpdateShoot } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createShoot: true })}
				disabled={!canCreateAndUpdateShoot}
			>
				Add Shoot
			</Button>
		</div>
	);
}
