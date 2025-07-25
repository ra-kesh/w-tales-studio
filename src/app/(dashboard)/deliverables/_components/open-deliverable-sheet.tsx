"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenDeliverableSheet() {
	const { setParams } = useDeliverableParams();

	const { canCreateAndUpdateDeliverable } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createDeliverable: true })}
				disabled={!canCreateAndUpdateDeliverable}
			>
				Add Deliverable
			</Button>
		</div>
	);
}
