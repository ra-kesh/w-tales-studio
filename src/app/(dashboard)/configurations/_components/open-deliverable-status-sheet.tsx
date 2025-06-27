"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";

export function OpenDeliverableStatusSheet() {
	const { setParams } = useDeliverableStatusParams();

	return (
		<div>
			<Button onClick={() => setParams({ createDeliverableStatus: true })}>
				Add Deliverable Status
			</Button>
		</div>
	);
}
