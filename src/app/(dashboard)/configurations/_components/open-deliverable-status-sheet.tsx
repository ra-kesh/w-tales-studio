"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenDeliverableStatusSheet() {
	const { setParams } = useDeliverableStatusParams();
	const { canCreateAndUpdateDeliverableStatus } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createDeliverableStatus: true })}
				disabled={!canCreateAndUpdateDeliverableStatus}
			>
				Add Deliverable Status
			</Button>
		</div>
	);
}
